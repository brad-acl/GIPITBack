import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [activosCount, cerradosCount, cerradostrimestreCount, profesionalesCount] = await Promise.all([
      prisma.process.count({
        where: {
          status: { equals: 'activo', mode: 'insensitive' }
        },
      }),
      prisma.process.count({
        where: {
          status: { equals: 'cerrado', mode: 'insensitive' },
          closed_at: { not: null },
        },
      }),
      prisma.process.count({
        where: {
          status: { equals: 'cerrado', mode: 'insensitive' },
          closed_at: { gte: threeMonthsAgo },
        },
      }),
      prisma.candidates.count({
        where: {
          candidate_management: {
            some: {
              status: { equals: 'activo', mode: 'insensitive' }
            },
          },
        },
      })
    ]);

    const ultimosProcesos = await prisma.process.findMany({
      where: {
        status: { equals: 'cerrado', mode: 'insensitive' },
        opened_at: { not: null },
        closed_at: { not: null }
      },
      orderBy: {
        closed_at: 'desc'
      },
      take: 6,
      select: {
        job_offer: true,
        opened_at: true,
        closed_at: true,
      },
    });

    const historicoTiempos: { labels: string[]; values: number[] } = {
      labels: [],
      values: []
    };

    ultimosProcesos.reverse().forEach(proceso => {
      const duracion = Math.round(
        (new Date(proceso.closed_at!).getTime() - new Date(proceso.opened_at!).getTime()) 
        / (1000 * 60 * 60 * 24)
      );
      
      historicoTiempos.labels.push(proceso.job_offer);
      historicoTiempos.values.push(duracion);
    });

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
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del dashboard' },
      { status: 500 }
    );
  }
}