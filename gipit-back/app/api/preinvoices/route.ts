import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const preInvoices = await prisma.pre_invoices.findMany();
    return NextResponse.json(preInvoices);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching pre-invoices' }, { status: 500 });
  }
}

const currentDate = new Date(); // Fecha actual
const nextMonthDate = new Date(); // Copia de la fecha actual

nextMonthDate.setMonth(currentDate.getMonth() + 1);

export async function POST(req: NextRequest) {
    const {  total_value, description, status } = await req.json();
    try {
      const preInvoice = await prisma.pre_invoices.create({
        data: {
          estimated_date: currentDate,
          expiration_date:nextMonthDate,
          total_value,
          description,
          status,
        },
      });
      return NextResponse.json(preInvoice, { status: 201 });
    } catch (error) {
        console.log({error})
      return NextResponse.json({ error: 'Error creating pre-invoice' }, { status: 500 });
    }
  }