import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const preInvoice = await prisma.pre_invoices.findUnique({
      where: { id: Number(id) },
    });
    if (!preInvoice) {
      return NextResponse.json({ error: 'Pre-invoice no encontrado' }, { status: 404 });
    }
    return NextResponse.json(preInvoice);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo pre-invoice' }, { status: 500 });
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
        console.log({error})
      return NextResponse.json({ error: 'Error actualizando pre-invoice' }, { status: 500 });
    }
  }

  export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
      await prisma.pre_invoices.delete({
        where: { id: Number(id) },
      });
      return NextResponse.json({ message: 'Pre-invoice borrado exitosamente' });
    } catch (error) {
      return NextResponse.json({ error: 'Error borrando pre-invoice' }, { status: 500 });
    }
  }
