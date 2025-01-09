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
    const { searchParams } = new URL(req.url);
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const query = url.searchParams.get('query') || '';
    const status = url.searchParams.get('status') || '';
    const year = url.searchParams.get('year') || '';
    const userRole = searchParams.get('userRole');
    const companyId = searchParams.get('companyId');

    const pageSize = 15;

    if (page < 1) {
      return NextResponse.json({ error: 'El número de página debe ser mayor que 0.' }, { status: 400 });
    }

    console.log('userRole:', userRole);
    console.log('companyId:', companyId);

    interface WhereClause {
      company_id?: number;
      OR?: Array<{
        pre_invoice_items: {
          some: {
            candidates: {
              is: {
                name: {
                  contains: string;
                  mode: 'insensitive';
                };
              };
            };
          };
        };
      }>;
      status?: string;
      estimated_date?: {
        gte: Date;
        lt: Date;
      };
      // Puedes agregar aquí más propiedades para otros filtros si los necesitas
    }
    
    // Y luego usarlo así:
    const whereClause: WhereClause = {};
    
    if (userRole === 'client' && companyId) {
      whereClause.company_id = parseInt(companyId);
    }
    
    if (query) {
      whereClause.OR = [
        {
          pre_invoice_items: {
            some: {
              candidates: {
                is: {
                  name: {
                    contains: query,
                    mode: 'insensitive' as const,
                  },
                },
              },
            },
          },
        }
      ];
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (year) {
      whereClause.estimated_date = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    console.log('whereClause antes de limpiar:', whereClause);

    console.log('whereClause final:', whereClause);

    const [preInvoices, total] = await prisma.$transaction([
      prisma.pre_invoices.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          pre_invoice_items: {
            include: {
              candidates: true,
            },
          },
        },
      }),
      prisma.pre_invoices.count({
        where: whereClause,
      }),
    ]);

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
      };
    });

    return NextResponse.json({
      total,
      batch: formattedPreInvoices,
    }, { status: 200 });
  } catch (err) {
    console.error('Error al procesar la solicitud:', err);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { 
      estimated_date, 
      expiration_date, 
      total_value, 
      description, 
      status, 
      professionals, 
      company_id 
    }: { 
      estimated_date: string;
      expiration_date: string;
      total_value: number;
      description: string;
      status: string;
      professionals: ProfessionalData[];
      company_id: number;
    } = await req.json();

    // Crear la pre-factura
    const preInvoice = await prisma.pre_invoices.create({
      data: {
        estimated_date: new Date(estimated_date),
        expiration_date: new Date(expiration_date),
        total_value: Number(total_value),
        description,
        status,
        company_id: Number(company_id)
      },
    });
    // Calcular el total antes de guardar


    // Crear los items de la pre-factura si hay profesionales
    if (professionals && professionals.length > 0) {
        await prisma.pre_invoice_items.createMany({
            data: professionals.map((prof) => {
                const subtotal = Number(prof.subtotal || 0);
                const vat = Number(prof.vat || 0);
                const total = subtotal + (subtotal * (vat / 100)); // Calcular el total

                return {
                    pre_invoice_id: preInvoice.id,
                    candidate_id: prof.id,
                    hours: Number(prof.hoursWorked || 0),
                    rate: String(prof.hourValue || 0),
                    total: String(total), // Guardar el total calculado
                    description: prof.notes || '',
                    service: '',
                    vat: String(vat),
                    subtotal: String(subtotal)
                };
            })
        });
    }

    return NextResponse.json(preInvoice, { status: 201 });
  } catch (err) {
    console.error('Error detallado al crear la factura:', err);
    return NextResponse.json({ 
      error: `Error al crear la factura: ${err}`,
      details: err 
    }, { status: 500 });
  }
}