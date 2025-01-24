import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

/**
 * @swagger
 * /preinvoices:
 *   get:
 *     summary: Obtener lista de todas las facturas
 *     tags: [Facturación]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página para la paginación
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Filtro de búsqueda por nombre de candidato
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtro por estado de la factura
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: Filtro por año de la factura
 *       - in: query
 *         name: userRole
 *         schema:
 *           type: string
 *         description: Rol del usuario
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: integer
 *         description: ID de la compañía para filtrar facturas
 *     responses:
 *       200:
 *         description: Lista de facturas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 batch:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PreInvoice'
 *       400:
 *         description: Número de página inválido
 *       500:
 *         description: Error al procesar la solicitud
 *   post:
 *     summary: Crear una nueva factura
 *     tags: [Facturación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estimated_date:
 *                 type: string
 *                 format: date
 *               expiration_date:
 *                 type: string
 *                 format: date
 *               total_value:
 *                 type: number
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               professionals:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Professional'
 *               company_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PreInvoice'
 *       500:
 *         description: Error al crear la factura
 */

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
    const managementId = searchParams.get('managementId');

    console.log('Parámetros de búsqueda:', {
      page,
      query,
      status,
      year,
      userRole,
      companyId,
      managementId
    });

    const pageSize = 15;

    if (page < 1) {
      return NextResponse.json({ error: 'El número de página debe ser mayor que 0.' }, { status: 400 });
    }

    console.log('userRole:', userRole);
    console.log('companyId:', companyId);

    const whereClause: Prisma.pre_invoicesWhereInput = {};
    
    // Filtro por compañía
    if (userRole === 'Cliente-Gerente' && companyId) {
      whereClause.company_id = parseInt(companyId);
    } else if (userRole === 'client' && managementId) {
      whereClause.pre_invoice_items = {
        some: {
          candidates: {
            candidate_management: {
              some: {
                management_id: parseInt(managementId)
              }
            }
          }
        }
      };
    }
    
    // Otros filtros
    if (query) {
      whereClause.OR = [
        {
          pre_invoice_items: {
            some: {
              candidates: {
                is: {
                  name: {
                    contains: query,
                    mode: 'insensitive',
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