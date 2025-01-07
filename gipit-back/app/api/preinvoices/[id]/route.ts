// api/preinvoices/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Se requiere ID de compañía' }, { status: 400 });
    }

    const preInvoice = await prisma.pre_invoices.findFirst({
      where: {
        id: Number(params.id),
        pre_invoice_items: {
          some: {
            candidates: {
              candidate_management: {
                some: {
                  management: {
                    company_id: parseInt(companyId)
                  }
                }
              }
            }
          }
        }
      },
      include: {
        pre_invoice_items: {
          include: {
            candidates: {
              include: {
                candidate_management: {
                  include: {
                    management: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!preInvoice) {
      return NextResponse.json({ error: 'Pre-factura no encontrada' }, { status: 404 });
    }

    const filteredItems = preInvoice.pre_invoice_items.filter(item => 
      item.candidates?.candidate_management?.some(cm => 
        cm.management?.company_id === parseInt(companyId)
      )
    );

    const candidates = filteredItems.map(item => item.candidates);

    return NextResponse.json({
      preInvoice: { ...preInvoice, pre_invoice_items: filteredItems },
      candidates
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