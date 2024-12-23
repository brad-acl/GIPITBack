import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = 15;

    if (page < 1) {
      return NextResponse.json({ error: 'El número de página debe ser mayor que 0.' }, { status: 400 });
    }

    const preInvoices = await prisma.pre_invoices.findMany({
      skip: (page - 1) * pageSize, 
      take: pageSize,      
      include: {
        _count: {
          select: {
            pre_invoice_items: true,
          },
        },
        pre_invoice_items: {
          include: {
            candidates: true,
          },
        },
      },
    });

    const total = await prisma.pre_invoices.count();
    const formattedPreInvoices = preInvoices.map((preInvoice) => {
      const candidates = preInvoice.pre_invoice_items.flatMap(item => item.candidates || []);
      const professionals = candidates.map(candidate => candidate.name).slice(0, 3);
      const additionalCount = candidates.length - 3;

      const professionalsDisplay = additionalCount > 0 
        ? `${professionals.join(', ')} y otros ${additionalCount}` 
        : professionals.join(', ');

      return {
        ...preInvoice,
        professionals: professionalsDisplay,
        cantidad: preInvoice._count.pre_invoice_items || 0,
      };
    });

    return NextResponse.json({
      total, 
      batch: formattedPreInvoices,
    });
  } catch (error) {
    return NextResponse.json({ error: `Error llamando informacion de facturas - ${error}` }, { status: 500 });
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
    return NextResponse.json({ error: `Error llamando actualizando factura - ${error}` }, { status: 500 });
  }
}
