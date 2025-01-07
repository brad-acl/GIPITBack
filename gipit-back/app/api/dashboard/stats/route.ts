import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [activosCount, cerradosCount, cerradostrimestreCount, profesionalesCount] = await Promise.all([
      prisma.process.count({
        where: {
          status: { equals: 'activo', mode: 'insensitive' },
          company_id: companyId ? parseInt(companyId) : undefined
        },
      }),
      prisma.process.count({
        where: {
          status: { equals: 'cerrado', mode: 'insensitive' },
          closed_at: { not: null },
          company_id: companyId ? parseInt(companyId) : undefined
        },
      }),
      prisma.process.count({
        where: {
          status: { equals: 'cerrado', mode: 'insensitive' },
          closed_at: { gte: threeMonthsAgo },
          company_id: companyId ? parseInt(companyId) : undefined
        },
      }),
      prisma.candidates.count({
        where: {
          candidate_management: {
            some: {
              status: { equals: 'activo', mode: 'insensitive' },
              management: {
                company_id: companyId ? parseInt(companyId) : undefined
              }
            },
          },
        },
      })
    ]);

    const procesosCerrados = await prisma.process.findMany({
      where: {
        status: { equals: 'cerrado', mode: 'insensitive' },
        opened_at: { not: null },
        closed_at: { not: null },
        company_id: companyId ? parseInt(companyId) : undefined,
        AND: [
          {
            closed_at: {
              lte: new Date()
            }
          }
        ]
      },
    });

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

    // Calcular el promedio solo con los procesos mostrados en el gráfico
    const promedioCierre = historicoTiempos.values.length > 0 
      ? Math.round(sumaDuraciones / historicoTiempos.values.length) 
      : 0;

    const ultimoProcesoActivo = await prisma.process.findFirst({
      where: {
        status: { equals: 'activo', mode: 'insensitive' }
      },
      orderBy: { opened_at: 'desc' },
      select: { opened_at: true }
    });

    const diasDesdeUltimoProcesoActivo = ultimoProcesoActivo?.opened_at
      ? Math.floor((new Date().getTime() - new Date(ultimoProcesoActivo.opened_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

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