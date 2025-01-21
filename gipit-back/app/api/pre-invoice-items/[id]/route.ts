// Ruta: /api/pre_invoice_items/[id]
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /pre-invoice-items/{id}:
 *   get:
 *     summary: Obtener detalles de un ítem de pre-factura
 *     tags: [Facturación]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del ítem de pre-factura
 *     responses:
 *       200:
 *         description: Detalles del ítem de pre-factura obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PreInvoiceItem'
 *       404:
 *         description: Ítem de pre-factura no encontrado
 *       500:
 *         description: Error al procesar la solicitud
 *   put:
 *     summary: Actualizar un ítem de pre-factura
 *     tags: [Facturación]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del ítem de pre-factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service:
 *                 type: string
 *               rate:
 *                 type: string
 *               hours:
 *                 type: number
 *               subtotal:
 *                 type: number
 *               vat:
 *                 type: number
 *               total:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ítem de pre-factura actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PreInvoiceItem'
 *       500:
 *         description: Error al actualizar el ítem de pre-factura
 *   delete:
 *     summary: Eliminar un ítem de pre-factura
 *     tags: [Facturación]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del ítem de pre-factura
 *     responses:
 *       200:
 *         description: Ítem de pre-factura eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Ítem de pre-factura no encontrado
 *       500:
 *         description: Error al eliminar el ítem de pre-factura
 */

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {



    const preInvoiceItem = await prisma.pre_invoice_items.findUnique({
      where: { id: Number(id) },
    });

    if (!preInvoiceItem) {
      return NextResponse.json({ error: 'Pre-invoice item not found' }, { status: 404 });
    }

    return NextResponse.json(preInvoiceItem);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { service, rate, hours, subtotal, vat, total, description } = await req.json();

  try {



    const preInvoiceItem = await prisma.pre_invoice_items.update({
      where: { id: Number(id) },
      data: {
        service,
        rate,
        hours,
        subtotal,
        vat,
        total,
        description,
      },
    });

    return NextResponse.json(preInvoiceItem);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // Verificar si la factura existe antes de intentar eliminarla
    const preInvoice = await prisma.pre_invoices.findUnique({
      where: { id: Number(id) },
    });

    if (!preInvoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Primero, eliminar los ítems de la pre-factura
    await prisma.pre_invoice_items.deleteMany({
      where: { pre_invoice_id: Number(id) },
    });

    // Luego, eliminar la pre-factura
    await prisma.pre_invoices.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Factura eliminada con éxito' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error al eliminar la factura - ${error}` }, { status: 500 });
  }
}
