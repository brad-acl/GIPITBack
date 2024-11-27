import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const process_id = req.nextUrl.searchParams.get('process_id');  // Acceder al parámetro de consulta

  if (!process_id || isNaN(Number(process_id))) {
    return NextResponse.json({ error: 'Parámetro process_id inválido o ausente' }, { status: 400 });
  }

  try {
    const candidateProcesses = await prisma.candidate_process.findMany({
      where: {
        process_id: parseInt(process_id), // Convertir process_id a número entero
      },
      include: {
        candidates: true,  // Incluir datos relacionados con los candidatos
        process: true,     // Incluir datos relacionados con el proceso
      },
    });

    if (candidateProcesses.length === 0) {
      return NextResponse.json({ error: 'No se encontraron procesos de candidatos para este proceso.' }, { status: 404 });
    }

    return NextResponse.json(candidateProcesses);
  } catch (error) {
    return NextResponse.json({ error: `Error al recuperar candidate_process: ${error}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { candidate_ids, technical_skills, soft_skills, client_comments, match_percent, interview_questions } = await req.json();

  try {
    const existingCandidateProcess = await prisma.candidate_process.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCandidateProcess) {
      return NextResponse.json({ error: 'No se encontró la asociación Candidate-Process' }, { status: 404 });
    }

    const updatedCandidateProcess = await prisma.candidate_process.update({
      where: { id: parseInt(id) },
      data: { technical_skills, soft_skills, client_comments, match_percent, interview_questions },
    });

    // Manejar la adición de nuevos candidatos si se proporcionan
    if (candidate_ids && candidate_ids.length > 0) {
      const addedCandidates = await Promise.all(
        candidate_ids.map(async (candidateId: number) => {
          const candidate = await prisma.candidates.findUnique({
            where: { id: candidateId },
          });

          if (!candidate) {
            throw new Error(`Candidato con ID ${candidateId} no encontrado`);
          }

          return prisma.candidate_process.create({
            data: {
              candidate_id: candidateId,
              process_id: parseInt(id),
            },
          });
        })
      );

      return NextResponse.json({
        message: 'Candidate-Process actualizado y candidatos agregados con éxito',
        updatedCandidateProcess,
        addedCandidates,
      });
    } else {
      return NextResponse.json({
        message: 'Candidate-Process actualizado con éxito',
        updatedCandidateProcess,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: `Error al actualizar candidate_process: ${error}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const deletedProcess = await prisma.candidate_process.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      message: 'Asociación Candidate-Process eliminada con éxito',
      deletedProcess, // También puedes devolver el proceso eliminado para confirmación
    });
  } catch (error) {
    return NextResponse.json({ error: `Error al eliminar candidate_process: ${error}` }, { status: 500 });
  }
}
