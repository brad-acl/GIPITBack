import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {


    const preInvoices = await prisma.pre_invoices.findMany();
    return NextResponse.json(preInvoices);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}

const currentDate = new Date(); 
const nextMonthDate = new Date(); 
nextMonthDate.setMonth(currentDate.getMonth() + 1);

export async function POST(req: NextRequest) {
  try {


    const { total_value, description, status } = await req.json();
    const preInvoice = await prisma.pre_invoices.create({
      data: {
        estimated_date: currentDate,
        expiration_date: nextMonthDate,
        total_value,
        description,
        status,
      },
    });
    return NextResponse.json(preInvoice, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}
