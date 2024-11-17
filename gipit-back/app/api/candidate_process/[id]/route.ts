import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const candidateProcesses = await prisma.candidate_process.findMany({
      where: { process_id: parseInt(id) },
      include: {
        candidates: true, 
        process: true,
      },
    });

    if (candidateProcesses.length === 0) {
      return NextResponse.json({ error: 'No candidates found for this process' }, { status: 404 });
    }

    return NextResponse.json(candidateProcesses);
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error.message}` }, { status: 500 });
  }
}







export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { candidate_ids, technical_skills, soft_skills, client_comments } = await req.json();

  try {
    const existingCandidateProcess = await prisma.candidate_process.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCandidateProcess) {
      return NextResponse.json({ error: 'Candidate-Process association not found' }, { status: 404 });
    }

    const updatedCandidateProcess = await prisma.candidate_process.update({
      where: { id: parseInt(id) },
      data: { technical_skills, soft_skills, client_comments },
    });

    if (candidate_ids && candidate_ids.length > 0) {
      const addedCandidates = await Promise.all(
        candidate_ids.map(async (candidateId: number) => {
          const candidate = await prisma.candidates.findUnique({
            where: { id: candidateId },
          });

          if (!candidate) {
            throw new Error(`Candidate with ID ${candidateId} not found`);
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
        message: 'Candidate-Process updated and candidates added successfully',
        updatedCandidateProcess,
        addedCandidates,
      });
    } else {
      return NextResponse.json({
        message: 'Candidate-Process updated successfully',
        updatedCandidateProcess,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error.message}` }, { status: 500 });
  }
}



export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await prisma.candidate_process.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Candidate-Process association deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error.message}` }, { status: 500 });
  }
}
