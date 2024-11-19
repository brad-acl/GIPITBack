import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const process = await prisma.process.findUnique({
      where: { id: parseInt(id) },  
      include: {
        candidate_process: {
          select: {
            candidates: { 
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                jsongpt_text: true, 
              },
            },
          },
        },
      },
    });

    if (!process) {
      return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 });
    }

    const candidates = process.candidate_process.map(cp => cp.candidates);

    return NextResponse.json({
      processId: process.id,
      jobOffer: process.job_offer,
      jobOfferDescription: process.job_offer_description,
      candidates, 
    });
  } catch (error) {
    return NextResponse.json({ error: `Error  - ${error}` }, { status: 500 });
  }
}





export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { job_offer, job_offer_description, company_id, opened_at, closed_at, pre_filtered, status } = await req.json();

  if (!job_offer || !job_offer_description || !company_id) {
    return NextResponse.json(
      { error: 'Missing required fields: job_offer, job_offer_description, company_id' },
      { status: 400 }
    );
  }

  const openedAtDate = opened_at ? new Date(opened_at) : null;
  const closedAtDate = closed_at ? new Date(closed_at) : null;

  if (openedAtDate && isNaN(openedAtDate.getTime())) {
    return NextResponse.json({ error: 'Invalid opened_at date format' }, { status: 400 });
  }
  if (closedAtDate && isNaN(closedAtDate.getTime())) {
    return NextResponse.json({ error: 'Invalid closed_at date format' }, { status: 400 });
  }

  const preFilteredBool = pre_filtered === 'true' || pre_filtered === true;

  try {
    const updatedProcess = await prisma.process.update({
      where: { id: parseInt(id) },
      data: {
        job_offer,
        job_offer_description,
        company_id: parseInt(company_id), 
        opened_at: openedAtDate,
        closed_at: closedAtDate,
        pre_filtered: preFilteredBool,
        status,
      },
    });

    return NextResponse.json(updatedProcess);
  } catch (error) {
    console.error("Error updating process:", error);
    return NextResponse.json({ error: `Error  - ${error}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const deletedProcess = await prisma.process.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      message: 'Proceso eliminado con éxito',
      deletedProcess, 
    });
  } catch (error) {
    console.error("Error deleting process:", error);
    return NextResponse.json({ error: `Error  - ${error}` }, { status: 500 });
  }
}