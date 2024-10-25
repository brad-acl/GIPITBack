import { NextRequest, NextResponse } from 'next/server';
import  { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()
export async function GET() {
  try {
    const preInvoiceItems = await prisma.pre_invoice_items.findMany();
    return NextResponse.json(preInvoiceItems);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo pre-invoice items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    const { pre_invoice_id, candidate_id, service, rate, hours, subtotal, vat, total, description } = await req.json();
    try {
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