import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * @swagger
 * /post_sales_activities:
 *   post:
 *     summary: Crear una nueva actividad de ventas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidate_management_id:
 *                 type: integer
 *               benefit:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               associated_cost:
 *                 type: number
 *               created_at:
 *                 type: string
 *                 format: date-time
 *               updated_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Actividad de ventas creada exitosamente
 *       500:
 *         description: Error al crear la actividad de ventas
 */
export async function POST(req: NextRequest) {
  const { candidate_management_id, benefit, description, date, associated_cost } = await req.json();
  
  try {
    const postSalesActivity = await prisma.post_sales_activities.create({
      data: {
        candidate_management_id,
        benefit,
        description,
        date,
        associated_cost,
        created_at: new Date(), // Automatically set current time
        updated_at: new Date(), // Automatically set current time
      },
    });
    return NextResponse.json(postSalesActivity, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating sales activity' }, { status: 500 });
  }
}

/**
 * @swagger
 * /post_sales_activities:
 *   get:
 *     summary: Obtener todas las actividades de ventas
 *     responses:
 *       200:
 *         description: Lista de actividades de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostSalesActivity' // Update this reference if needed
 */
export async function GET() {
  try {
    const postSalesActivities = await prisma.post_sales_activities.findMany();
    return NextResponse.json(postSalesActivities);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching sales activities' }, { status: 500 });
  }
}
