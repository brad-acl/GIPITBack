// Ruta: /api/pre_invoices/[id]
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../middleware'; 

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const preInvoice = await prisma.pre_invoices.findUnique({
      where: { id: Number(id) },
    });

    if (!preInvoice) {
      return NextResponse.json({ error: 'Pre-invoice not found' }, { status: 404 });
    }

    return NextResponse.json(preInvoice);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { estimated_date, expiration_date, total_value, description, status } = await req.json();

  try {

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

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

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    await prisma.pre_invoices.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Pre-invoice deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
  }
}