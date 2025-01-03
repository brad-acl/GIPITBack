// Ruta: /api/pre_invoices/[id]
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const preInvoice = await prisma.pre_invoices.findUnique({
      where: { id: Number(id) },
      include: {
        pre_invoice_items: {
          include: {
            candidates: true,
          },
        },
      },
    });

    if (!preInvoice) {
      return NextResponse.json({ error: 'Pre-invoice not found' }, { status: 404 });
    }

    // Procesar los detalles de la factura y los candidatos
    const candidates = preInvoice.pre_invoice_items.flatMap(item => item.candidates);
    console.log('Detalles de la factura:', preInvoice);
    console.log('Candidatos asociados:', candidates);

    return NextResponse.json({
      preInvoice,
      candidates,
    });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { estimated_date, expiration_date, total_value, description, status } = await req.json();

  try {
    const preInvoice = await prisma.pre_invoices.update({
      where: { id: Number(id) },
      data: {
        estimated_date,
        expiration_date,
        total_value,
        description,
        status,
      },
    });

    return NextResponse.json(preInvoice);
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {

    

    await prisma.pre_invoices.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Pre-invoice deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
  }
}