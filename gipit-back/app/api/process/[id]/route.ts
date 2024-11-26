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

    const candidates = process.candidate_process.flatMap(cp => cp.candidates);

    return NextResponse.json({
      processId: process.id,
      jobOffer: process.job_offer, 
      jobOfferDescription: process.job_offer_description,
      candidates,
      status: process.status ?? '', 
      openedAt: process.opened_at ? new Date(process.opened_at).toLocaleDateString() : null, 
      closedAt: process.closed_at ? new Date(process.closed_at).toLocaleDateString() : null, 
      preFiltered: process.pre_filtered ?? false, 
    });
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error.message}` }, { status: 500 });
  }
}







export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { job_offer_description, opened_at, closed_at, pre_filtered, status } = await req.json();

  // Ensure job_offer_description is provided
  if (!job_offer_description) {
    return NextResponse.json(
      { error: 'faltan campos: job_offer_description' },
      { status: 400 }
    );
  }

  // Parse the date fields, if provided
  const openedAtDate = opened_at ? new Date(opened_at) : null;
  const closedAtDate = closed_at ? new Date(closed_at) : null;

  // Validate dates if they are provided
  if (openedAtDate && isNaN(openedAtDate.getTime())) {
    return NextResponse.json({ error: 'Fecha de apertura inválida' }, { status: 400 });
  }
  if (closedAtDate && isNaN(closedAtDate.getTime())) {
    return NextResponse.json({ error: 'Fecha de cierre inválida' }, { status: 400 });
  }

  // Parse the pre_filtered field
  const preFilteredBool = pre_filtered === 'true' || pre_filtered === true;

  try {
    // Update process in the database with only the job offer description
    const updatedProcess = await prisma.process.update({
      where: { id: parseInt(id) },
      data: {
        job_offer_description, // Update the job_offer_description
        opened_at: openedAtDate,
        closed_at: closedAtDate,
        pre_filtered: preFilteredBool,
        status,
      },
    });

    return NextResponse.json(updatedProcess); // Return the updated process details
  } catch (error) {
    console.error("Error actualizando proceso:", error);
    return NextResponse.json({ error: `Error actualizando proceso: ${error.message || error}` }, { status: 500 });
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
    console.error("Error eliminando proceso:", error);
    return NextResponse.json({ error: `Error eliminando proceso: ${error.message || error}` }, { status: 500 });
  }
}