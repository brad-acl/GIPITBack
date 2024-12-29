import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { candidate_id, process_id, technical_skills, soft_skills, client_comments, match_percent, interview_questions, stage} = await req.json();

  try {
    const candidateProcess = await prisma.candidate_process.create({
      data: {
        candidate_id,
        process_id,
        technical_skills,
        soft_skills,
        client_comments,
        match_percent,
        interview_questions,
        stage // Entrevistas, Seleccionado, Descartado
      },
    });

    return NextResponse.json(candidateProcess, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error al postear candidate_process: ${error}` }, { status: 500 });
  }
  
}




// Manejo del método GET para obtener todos los registros
export async function GET() {
  try {
    const candidateProcesses = await prisma.candidate_process.findMany();
    return NextResponse.json(candidateProcesses, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Error al obtener candidate_process: ${error}` },
      { status: 500 }
    );
  }
}