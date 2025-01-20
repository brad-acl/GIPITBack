// Ruta: /api/pre-invoice-items
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /pre-invoice-items:
 *   get:
 *     summary: Obtener lista de todos los ítems de pre-facturas
 *     tags: [Facturación]
 *     responses:
 *       200:
 *         description: Lista de ítems de pre-facturas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PreInvoiceItem'
 *       500:
 *         description: Error al procesar la solicitud
 *   post:
 *     summary: Crear un nuevo ítem de pre-factura
 *     tags: [Facturación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pre_invoice_id:
 *                 type: integer
 *               candidate_id:
 *                 type: integer
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
 *       201:
 *         description: Ítem de pre-factura creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PreInvoiceItem'
 *       500:
 *         description: Error al crear el ítem de pre-factura
 */

export async function GET() {
  try {


    const preInvoiceItems = await prisma.pre_invoice_items.findMany();
    return NextResponse.json(preInvoiceItems);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {


    const { pre_invoice_id, candidate_id, service, rate, hours, subtotal, vat, total, description } = await req.json();
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
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}
