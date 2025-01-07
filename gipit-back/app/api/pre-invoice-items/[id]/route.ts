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
    // Verificar si la factura existe antes de intentar eliminarla
    const preInvoice = await prisma.pre_invoices.findUnique({
      where: { id: Number(id) },
    });

    if (!preInvoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Primero, eliminar los ítems de la pre-factura
    await prisma.pre_invoice_items.deleteMany({
      where: { pre_invoice_id: Number(id) },
    });

    // Luego, eliminar la pre-factura
    await prisma.pre_invoices.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Factura eliminada con éxito' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error al eliminar la factura - ${error}` }, { status: 500 });
  }
}
