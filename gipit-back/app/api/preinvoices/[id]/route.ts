// Ruta: /api/pre_invoices/[id]
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

/**
 * @swagger
 * /preinvoices/{id}:
 *   get:
 *     summary: Obtener detalles de una factura
 *     tags: [Facturación]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: integer
 *         description: ID de la compañía para filtrar facturas
 *       - in: query
 *         name: userRole
 *         schema:
 *           type: string
 *         description: Rol del usuario
 *     responses:
 *       200:
 *         description: Detalles de la factura obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preInvoice:
 *                   $ref: '#/components/schemas/PreInvoice'
 *                 candidates:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Factura no encontrada
 *       500:
 *         description: Error al obtener los detalles de la factura
 *   put:
 *     summary: Actualizar una factura
 *     tags: [Facturación]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
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
 *       200:
 *         description: Factura actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PreInvoice'
 *       500:
 *         description: Error al actualizar la factura
 *   patch:
 *     summary: Cambiar el estado de una factura
 *     tags: [Facturación]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Acción a realizar (aprobar o rechazar)
 *     responses:
 *       200:
 *         description: Estado de la factura actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedInvoice:
 *                   $ref: '#/components/schemas/PreInvoice'
 *       400:
 *         description: Acción no reconocida
 *       500:
 *         description: Error al cambiar el estado de la factura
 */

// Define un tipo para los profesionales
interface Professional {
    id: number;
    hoursWorked: number;
    hourValue: number;
    subtotal: number;
    vat: number;
    notes?: string;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  const userRole = searchParams.get('userRole');

  try {

    const whereClause = {
      id: Number(id),
      ...(userRole === 'client' && companyId ? { company_id: parseInt(companyId) } : {})
    };

    const preInvoice = await prisma.pre_invoices.findFirst({
      where: whereClause,
      include: {
        pre_invoice_items: {
          include: {
            candidates: true,
          },
        },
      },
    });

    if (!preInvoice) {
      return NextResponse.json({ error: 'Pre-invoice not found' }, { status: 404 });
    }

    const candidates = preInvoice.pre_invoice_items.flatMap(item => item.candidates);

    return NextResponse.json({
      preInvoice,
      candidates,
    });
  } catch (error) {
    console.error('Error en GET preinvoices/[id]:', error);
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
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
      professionals: Professional[];
      company_id: number;
    } = await req.json();

    const preInvoice = await prisma.pre_invoices.update({
      where: { id: Number(id) },
      data: {
        estimated_date: new Date(estimated_date),
        expiration_date: new Date(expiration_date),
        total_value: Number(total_value),
        description,
        status,
        company_id: Number(company_id)
      },
    });

    await prisma.pre_invoice_items.deleteMany({
      where: { pre_invoice_id: Number(id) }
    });

    if (professionals && professionals.length > 0) {
      await prisma.pre_invoice_items.createMany({
        data: professionals.map((prof: Professional) => {
          const subtotal = Number(prof.subtotal || 0);
          const vat = Number(prof.vat || 0);
          const total = subtotal + (subtotal * (vat / 100));

          return {
            pre_invoice_id: Number(id),
            candidate_id: prof.id,
            hours: Number(prof.hoursWorked || 0),
            rate: String(prof.hourValue || 0),
            total: String(total),
            description: prof.notes || '',
            service: '',
            vat: String(vat),
            subtotal: String(subtotal)
          };
        })
      });
    }

    return NextResponse.json(preInvoice);
  } catch (err) {
    console.error('Error detallado:', err);
    return NextResponse.json({ error: `Error en la actualización: ${err}` }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { action } = await req.json();

  try {
    if (action === 'reject') {
      const updatedInvoice = await prisma.pre_invoices.update({
        where: { id: Number(id) },
        data: { status: 'rechazado' },
      });
      return NextResponse.json({ message: 'Factura rechazada con éxito', updatedInvoice });
    } else if (action === 'approve') {
      const updatedInvoice = await prisma.pre_invoices.update({
        where: { id: Number(id) },
        data: { status: 'aprobado' },
      });
      return NextResponse.json({ message: 'Factura aprobada con éxito', updatedInvoice });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Error al cambiar el estado de la factura:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `Error al cambiar el estado de la factura: ${error.message}` }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Error desconocido al cambiar el estado de la factura' }, { status: 500 });
    }
  }
}