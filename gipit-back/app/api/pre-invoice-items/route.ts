// Ruta: /api/pre-invoice-items
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware'; 

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const verificationResult = verifyToken(req);

    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const preInvoiceItems = await prisma.pre_invoice_items.findMany();
    return NextResponse.json(preInvoiceItems);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo pre-invoice items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const verificationResult = verifyToken(req);

    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const { pre_invoice_id, candidate_id, service, rate, hours, subtotal, vat, total, description } = await req.json();
    const preInvoiceItem = await prisma.pre_invoice_items.create({
      data: {
        pre_invoice_id,
        candidate_id,
        service,
        rate,
        hours,
        subtotal,
        vat,
        total,
        description,
      },
    });
    return NextResponse.json(preInvoiceItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creando pre-invoice item' }, { status: 500 });
  }
}
