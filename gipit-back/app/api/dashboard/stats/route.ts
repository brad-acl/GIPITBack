import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Obtener procesos activos del último trimestre
    const activosCount = await prisma.process.count({
      where: {
        status: {
          equals: 'activo',
          mode: 'insensitive'
        }
      },
    });

    // Obtener procesos cerrados
    const cerradosCount = await prisma.process.count({
      where: {
        status: {
          equals: 'cerrado',
          mode: 'insensitive'
        },
        closed_at: {
          not: null
        }
      },
    });

    // Obtener procesos cerrados del último trimestre
    const cerradostrimestreCount = await prisma.process.count({
      where: {
        status: {
          equals: 'cerrado',
          mode: 'insensitive' 
        },
        closed_at: {
          gte: threeMonthsAgo,
        },
      },
    });
    
    // Obtener profesionales activos
    const profesionalesCount = await prisma.candidates.count({
      where: {
        candidate_management: {
          some: {
            status: {
              equals: 'activo',
              mode: 'insensitive'
            },
          },
        },
      },
    });

    // Calcular tiempo promedio de cierre
    const procesosTerminados = await prisma.process.findMany({
      where: {
        status: {
          equals: 'cerrado',
          mode: 'insensitive'
        },
        opened_at: { not: null },
        closed_at: { not: null }
      },
      select: {
        opened_at: true,
        closed_at: true,
      },
    });

    let tiempoCierre = 0;
    if (procesosTerminados.length > 0) {
      const tiempoTotal = procesosTerminados.reduce((acc, proceso) => {
        const inicio = new Date(proceso.opened_at!);
        const fin = new Date(proceso.closed_at!);
        return acc + (fin.getTime() - inicio.getTime());
      }, 0);
      
      // Convertir de milisegundos a días
      tiempoCierre = Math.round(tiempoTotal / (1000 * 60 * 60 * 24 * procesosTerminados.length));
    }

    // Organizar procesos por mes y calcular promedios
    const tiemposPorMes = new Map();

    procesosTerminados.forEach(proceso => {
      const mes = new Date(proceso.closed_at!).toLocaleString('es-ES', { month: 'short' });
      const duracion = Math.round(
        (new Date(proceso.closed_at!).getTime() - new Date(proceso.opened_at!).getTime()) 
        / (1000 * 60 * 60 * 24)
      );
      
      if (!tiemposPorMes.has(mes)) {
        tiemposPorMes.set(mes, { total: 0, count: 0 });
      }
      
      const mesData = tiemposPorMes.get(mes);
      mesData.total += duracion;
      mesData.count += 1;
    });

    const historicoTiempos = {
      labels: Array.from(tiemposPorMes.keys()),
      values: Array.from(tiemposPorMes.values()).map(data => 
        Math.round(data.total / data.count)
      )
    };

    // Obtener la fecha de apertura del último proceso activo
    const ultimoProcesoActivo = await prisma.process.findFirst({
      where: {
        status: {
          equals: 'activo',
          mode: 'insensitive'
        }
      },
      orderBy: {
        opened_at: 'desc' // Ordenar por fecha de apertura, de más reciente a más antigua
      },
      select: {
        opened_at: true // Solo necesitamos la fecha de apertura
      }
    });

    let diasDesdeUltimoProcesoActivo = 0;
    if (ultimoProcesoActivo && ultimoProcesoActivo.opened_at) {
      const fechaUltimoProceso = new Date(ultimoProcesoActivo.opened_at);
      const diferenciaTiempo = new Date().getTime() - fechaUltimoProceso.getTime();
      diasDesdeUltimoProcesoActivo = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24)); // Convertir a días
    }

    return NextResponse.json({
      activosCount,
      cerradosCount,
      cerradostrimestreCount,
      profesionalesCount,
      tiempoCierre,
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