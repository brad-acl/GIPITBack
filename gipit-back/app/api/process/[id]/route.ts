import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // Fetch the process along with associated candidates using Prisma's `include` for relation
    const process = await prisma.process.findUnique({
      where: { id: parseInt(id) },
      include: {
        candidate_process: {  // Assuming candidate_process is the join table
          select: {
            candidates: true,  // Include related candidates data (modify according to your schema)
          },
        },
      },
    });

    if (!process) {
      return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 });
    }

    // Safely check if candidate_process is populated
    const candidatesIds = process.candidate_process?.length
      ? process.candidate_process.map(cp => cp.candidates.id)
      : [];  // Default to an empty array if no candidates

    // Return the process along with the list of candidate IDs (or empty if no candidates)
    return NextResponse.json({
      ...process,  // Spread process data
      candidatesIds,  // Include the candidatesIds, which will be an empty array if no candidates
    });
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error.message}` }, { status: 500 });
  }
}




export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { job_offer, job_offer_description, company_id, opened_at, closed_at, pre_filtered, status } = await req.json();

  // Basic validation for required fields
  if (!job_offer || !job_offer_description || !company_id) {
    return NextResponse.json(
      { error: 'Missing required fields: job_offer, job_offer_description, company_id' },
      { status: 400 }
    );
  }

  // Convert opened_at and closed_at to Date objects
  const openedAtDate = opened_at ? new Date(opened_at) : null;
  const closedAtDate = closed_at ? new Date(closed_at) : null;

  // Validate dates
  if (openedAtDate && isNaN(openedAtDate.getTime())) {
    return NextResponse.json({ error: 'Invalid opened_at date format' }, { status: 400 });
  }
  if (closedAtDate && isNaN(closedAtDate.getTime())) {
    return NextResponse.json({ error: 'Invalid closed_at date format' }, { status: 400 });
  }

  // Convert pre_filtered to boolean
  const preFilteredBool = pre_filtered === 'true' || pre_filtered === true;

  try {
    // Prisma update operation
    const updatedProcess = await prisma.process.update({
      where: { id: parseInt(id) },
      data: {
        job_offer,
        job_offer_description,
        company_id: parseInt(company_id), // Ensure company_id is an integer
        opened_at: openedAtDate,
        closed_at: closedAtDate,
        pre_filtered: preFilteredBool,
        status,
      },
    });

    return NextResponse.json(updatedProcess);
  } catch (error) {
    console.error("Error updating process:", error);
    return NextResponse.json({ error: `Error updating process: ${error.message || error}` }, { status: 500 });
  }
}
