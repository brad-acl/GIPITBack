// api/preinvoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProfessionalData {
  id: number;
  service?: string;
  hourValue: number;
  hoursWorked?: number;
  subtotal?: number;
  vat?: number;
  notes?: string;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const companyId = url.searchParams.get('companyId');
    const pageSize = 15;

    if (!companyId) {
      return NextResponse.json({ error: 'Se requiere ID de compañía' }, { status: 400 });
    }

    const preInvoices = await prisma.pre_invoices.findMany({
      where: {
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
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: {
          select: { pre_invoice_items: true }
        },
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

    const total = await prisma.pre_invoices.count({
      where: {
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
      }
    });

    const formattedPreInvoices = preInvoices.map((preInvoice) => {
      const candidatesOfCompany = preInvoice.pre_invoice_items
        .filter(item => item.candidates?.candidate_management
          ?.some(cm => cm.management?.company_id === parseInt(companyId)))
        .map(item => item.candidates);

      const professionals = candidatesOfCompany.map(candidate => candidate?.name).slice(0, 3);
      const additionalCount = candidatesOfCompany.length - 3;

      return {
        ...preInvoice,
        professionals: additionalCount > 0 
          ? `${professionals.join(', ')} y otros ${additionalCount}` 
          : professionals.join(', '),
        cantidad: preInvoice._count.pre_invoice_items
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

export async function POST(req: NextRequest) {
  console.log('Solicitud POST recibida');
  try {
    const { estimated_date, expiration_date, total_value, description, status, professionals }: { 
      estimated_date: string; 
      expiration_date: string; 
      total_value: number; 
      description: string; 
      status: string; 
      professionals: ProfessionalData[];
    } = await req.json();

    console.log('Datos recibidos en el backend:', { estimated_date, expiration_date, total_value, description, status, professionals });

    const preInvoice = await prisma.pre_invoices.create({
      data: {
        estimated_date: new Date(estimated_date),
        expiration_date: new Date(expiration_date),
        total_value,
        description,
        status,
      },
    });

    console.log('Factura creada con éxito:', preInvoice);

    const preInvoiceItems = professionals.map((prof) => ({
      pre_invoice_id: preInvoice.id,
      candidate_id: prof.id,
      service: prof.service || '',
      rate: prof.hourValue,
      hours: prof.hoursWorked || 0,
      subtotal: prof.subtotal || 0,
      vat: prof.vat || 0,
      total: prof.subtotal || 0,
      description: prof.notes || '',
    }));

    await prisma.pre_invoice_items.createMany({
      data: preInvoiceItems,
    });

    return NextResponse.json(preInvoice, { status: 201 });
  } catch (error) {
    console.error('Error al guardar la factura:', error);
    return NextResponse.json({ error: `Error al guardar la factura - ${error}` }, { status: 500 });
  }
}