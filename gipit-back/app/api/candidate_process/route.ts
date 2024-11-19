import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
  const { candidate_id, process_id, technical_skills, soft_skills, client_comments } = await req.json();

  try {
    const candidateProcess = await prisma.candidate_process.create({
      data: {
        candidate_id,
        process_id,
        technical_skills,
        soft_skills,
        client_comments,
      },
    });

    return NextResponse.json(candidateProcess, { status: 201 });
  } catch (error: unknown) { 
    if (error instanceof Error) {  
      return NextResponse.json({ error: `Error al asociar candidato al proceso: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}


export async function GET() {
  try {
    const candidateProcesses = await prisma.candidate_process.findMany();

    if (!candidateProcesses || candidateProcesses.length === 0) {
      return NextResponse.json({ error: 'No candidate-process relationships found' }, { status: 404 });
    }

    return NextResponse.json(candidateProcesses);
  } catch (error: unknown) {  
    if (error instanceof Error) { 
      return NextResponse.json({ error: `Error fetching data: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}