// Ruta: /api/pre_invoice_items/[id]
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {



    const preInvoiceItem = await prisma.pre_invoice_items.findUnique({
      where: { id: Number(id) },
    });

    if (!preInvoiceItem) {
      return NextResponse.json({ error: 'Pre-invoice item not found' }, { status: 404 });
    }

    return NextResponse.json(preInvoiceItem);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { service, rate, hours, subtotal, vat, total, description } = await req.json();

  try {



    const preInvoiceItem = await prisma.pre_invoice_items.update({
      where: { id: Number(id) },
      data: {
        service,
        rate,
        hours,
        subtotal,
        vat,
        total,
        description,
      },
    });

    return NextResponse.json(preInvoiceItem);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {



    await prisma.pre_invoice_items.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Pre-invoice item deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}
