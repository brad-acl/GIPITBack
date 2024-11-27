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
    return NextResponse.json({ error: `Error al recuperar procesos: ${error}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { job_offer_description, opened_at, closed_at, pre_filtered, status } = await req.json();

  // Asegurarse de que se haya proporcionado la descripción de la oferta de trabajo
  if (!job_offer_description) {
    return NextResponse.json(
      { error: 'Faltan campos: job_offer_description' },
      { status: 400 }
    );
  }

  // Parsear los campos de fecha, si se proporcionan
  const openedAtDate = opened_at ? new Date(opened_at) : null;
  const closedAtDate = closed_at ? new Date(closed_at) : null;

  // Validar las fechas si se proporcionan
  if (openedAtDate && isNaN(openedAtDate.getTime())) {
    return NextResponse.json({ error: 'Fecha de apertura inválida' }, { status: 400 });
  }
  if (closedAtDate && isNaN(closedAtDate.getTime())) {
    return NextResponse.json({ error: 'Fecha de cierre inválida' }, { status: 400 });
  }

  // Parsear el campo pre_filtered
  const preFilteredBool = pre_filtered === 'true' || pre_filtered === true;

  try {
    // Actualizar el proceso en la base de datos con solo la descripción de la oferta de trabajo
    const updatedProcess = await prisma.process.update({
      where: { id: parseInt(id) },
      data: {
        job_offer_description, // Actualizar la descripción de la oferta de trabajo
        opened_at: openedAtDate,
        closed_at: closedAtDate,
        pre_filtered: preFilteredBool,
        status,
      },
    });

    return NextResponse.json(updatedProcess); // Devolver los detalles del proceso actualizado
  } catch (error) {
    return NextResponse.json({ error: `Error al actualizar proceso: ${error}` }, { status: 500 });
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
    return NextResponse.json({ error: `Error al eliminar id: ${error}` }, { status: 500 });
  }
}
