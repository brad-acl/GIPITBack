import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const managementId = searchParams.get('managementId');

    console.log('Received Company ID:', companyId);
    console.log('Received Management ID:', managementId);

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const processFilter = companyId 
    ? {
        management: {
          company_id: parseInt(companyId)
        }
      } 
    : managementId
      ? {
          management_id: parseInt(managementId)
        }
      : {};

      const professionalFilter = companyId 
      ? {
          candidate_management: {
            some: {
              status: 'activo',
              management: {
                company_id: parseInt(companyId)
              }
            }
          }
        }
      : managementId
        ? {
            candidate_management: {
              some: {
                status: 'activo',
                management_id: parseInt(managementId)
              }
            }
          }
        : {};

    // Modificamos el filtro de management
    const processCompanyFilter = companyId 
      ? {
          management: {
            company_id: parseInt(companyId)
          }
        } 
      : managementId
        ? {
            management_id: parseInt(managementId)
          }
        : {};

    console.log('Company Filter:', JSON.stringify(processCompanyFilter));


    const [activosCount, cerradosCount, cerradostrimestreCount, profesionalesCount] = await Promise.all([
      prisma.process.count({
        where: {
          status: { equals: 'activo', mode: 'insensitive' },
          ...processFilter
        },
      }),
      prisma.process.count({
        where: {
          status: { equals: 'cerrado', mode: 'insensitive' },
          closed_at: { not: null },
          ...processFilter
        },
      }),
      prisma.process.count({
        where: {
          status: { equals: 'cerrado', mode: 'insensitive' },
          closed_at: { gte: threeMonthsAgo },
          ...processFilter
        },
      }),
      prisma.candidates.count({
        where: {
          ...professionalFilter
        },
      })
    ]);

    console.log('Counts:', {
      activosCount,
      cerradosCount,
      cerradostrimestreCount,
      profesionalesCount
    });

    const procesosCerrados = await prisma.process.findMany({
      where: {
        status: { equals: 'cerrado', mode: 'insensitive' },
        opened_at: { not: null },
        closed_at: { not: null, gte: threeMonthsAgo },
        ...processFilter
      },
      orderBy: {
        closed_at: 'desc'
      },
      take: 6
    });

    console.log('Procesos Cerrados Count:', procesosCerrados.length);

    const historicoTiempos: { labels: string[]; values: number[] } = {
      labels: [],
      values: []
    };

    let sumaDuraciones = 0;

    procesosCerrados.forEach(proceso => {
      if (proceso.opened_at && proceso.closed_at) {
        const fechaApertura = new Date(proceso.opened_at);
        const fechaCierre = new Date(proceso.closed_at);
        
        const duracion = Math.max(1, Math.round(
          (fechaCierre.getTime() - fechaApertura.getTime()) 
          / (1000 * 60 * 60 * 24)
        ));
        
        historicoTiempos.labels.unshift(proceso.job_offer);
        historicoTiempos.values.unshift(duracion);
        sumaDuraciones += duracion;
      }
    });

    const promedioCierre = historicoTiempos.values.length > 0 
      ? Math.round(sumaDuraciones / historicoTiempos.values.length) 
      : 0;

    const ultimoProcesoActivo = await prisma.process.findFirst({
      where: {
        status: { equals: 'activo', mode: 'insensitive' },
        ...processFilter
      },
      orderBy: { opened_at: 'desc' },
      select: { opened_at: true }
    });

    const diasDesdeUltimoProcesoActivo = ultimoProcesoActivo?.opened_at
      ? Math.floor((new Date().getTime() - new Date(ultimoProcesoActivo.opened_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

      console.log('Final Response:', {
        activosCount,
        cerradosCount,
        cerradostrimestreCount,
        profesionalesCount,
        historicoTiempos,
        diasDesdeUltimoProcesoActivo,
        promedioCierre
      });

    return NextResponse.json({
      activosCount,
      cerradosCount,
      cerradostrimestreCount,
      profesionalesCount,
      historicoTiempos,
      diasDesdeUltimoProcesoActivo,
      promedioCierre
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del dashboard' },
      { status: 500 }
    );
  }
}