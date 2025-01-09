import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

// Definir una interfaz más específica para la cláusula where
interface WhereClause {
  AND: {
    candidates?: {
      name?: {
        contains: string;
        mode: 'insensitive';
      };
    };
    status?: string;
  }[];
}

/**
 * Obtener todos los registros de gestión de candidatos
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const query = url.searchParams.get('query') || '';
    const status = url.searchParams.get('status') || '';
    const pageSize = 15;

    if (page < 1) {
      return NextResponse.json(
        { error: 'El número de página debe ser mayor que 0.' },
        { status: 400 }
      );
    }

    const whereClause: WhereClause = { AND: [] };

    if (query) {
      whereClause.AND.push({
        candidates: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
      });
    }

    if (status) {
      whereClause.AND.push({ status: status });
    }

    const [candidateManagementRecords, total] = await prisma.$transaction([
      prisma.candidate_management.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          management: true,
          candidates: true,
        },
        orderBy: {
          id: 'asc',
        },
      }),
      prisma.candidate_management.count({
        where: whereClause,
      }),
    ]);

    const mappedRecords = candidateManagementRecords.map(record => ({
      id: record.id,
      name: record.candidates?.name || '',
      role: record.position || '',
      client: record.management?.name || '',
      start: record.start_date,
      end: record.end_date,
      status: record.status || '',
      rate: record.rate || 0,
    }));

    return NextResponse.json({
      total,
      batch: mappedRecords,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener los registros:', error.message);
      return NextResponse.json(
        { error: `Error al obtener los datos: ${error.message}` },
        { status: 500 }
      );
    } else {
      console.error('Error desconocido:', error);
      return NextResponse.json(
        { error: 'Error desconocido al obtener los datos.' },
        { status: 500 }
      );
    }
  }
}