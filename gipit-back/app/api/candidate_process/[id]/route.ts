import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { process_id } = req.query;  // Destructure the query parameter

  if (!process_id || isNaN(Number(process_id))) {
    // Ensure the process_id is present and is a valid number
    return NextResponse.json({ error: 'Invalid or missing process_id query parameter' }, { status: 400 });
  }

  try {
    // Query all candidate_process entries for a specific process_id
    const candidateProcesses = await prisma.candidate_process.findMany({
      where: {
        process_id: parseInt(process_id as string), // Safely parse the process_id to integer
      },
      include: {
        candidates: true,  // Include related candidate data
        process: true,     // Include related process data
      },
    });

    if (candidateProcesses.length === 0) {
      // Handle the case where no candidate processes are found
      return NextResponse.json({ error: 'No candidate processes found for this process.' }, { status: 404 });
    }

    // Return the candidate processes along with related candidate and process data
    return NextResponse.json(candidateProcesses);
  } catch (error) {
    // General error handler for any unexpected issues
    return NextResponse.json({ error: `Server Error - ${error.message}` }, { status: 500 });
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
      return NextResponse.json({ error: 'Candidate-Process association not found' }, { status: 404 });
    }

    const updatedCandidateProcess = await prisma.candidate_process.update({
      where: { id: parseInt(id) },
      data: { technical_skills, soft_skills, client_comments, match_percent, interview_questions },
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
