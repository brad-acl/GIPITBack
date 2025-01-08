import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
  const {
    name,
    phone,
    email,
    address,
    jsongpt_text,
    process_id, // Incluye process_id en el cuerpo de la solicitud para asociar el proceso.
    technical_skills,
    soft_skills,
    client_comments,
    match_percent,
    total_experience,
    stage,
    interview_questions,
  } = await req.json();

  try {

    // Verificar si ya existe un candidato con el mismo correo electrónico o teléfono
    const existingCandidate = await prisma.candidates.findFirst({
      where: {
        OR: [
          { email: email },
          { phone: phone },
        ],
      },
    });

    if (existingCandidate) {
      return NextResponse.json(
        {
          success: false,
          message: 'El candidato ya existe con el mismo correo electrónico o número de teléfono.',
        },
        { status: 409 } // Código HTTP para conflicto
      );
    }

    const candidate = await prisma.candidates.create({
      data: {
        name,
        phone,
        email,
        address,
        jsongpt_text,
        total_experience
      },
    });

    let candidateProcess = null;
    if (process_id) {
      candidateProcess = await prisma.candidate_process.create({
        data: {
          candidate_id: candidate.id,
          process_id,
          technical_skills,
          soft_skills,
          client_comments,
          match_percent,
          interview_questions,
          stage
        },
      });
    }
    
    return NextResponse.json({
      candidate,
      candidateProcess,
      message: "Candidato y relación con el proceso creados exitosamente",
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: `Error al crear candidato o asociarlo al proceso: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}

export async function GET() {
  try {


    const candidates = await prisma.candidates.findMany();
    return NextResponse.json(candidates);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}
