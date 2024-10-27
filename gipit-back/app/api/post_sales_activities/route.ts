import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../middleware'; 
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
  try {
    const verificationResult = verifyToken(req);

    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const { candidate_management_id, benefit, description, date, associated_cost } = await req.json();
  
    const postSalesActivity = await prisma.post_sales_activities.create({
      data: {
        candidate_management_id,
        benefit,
        description,
        date,
        associated_cost,
        created_at: new Date(), 
        updated_at: new Date(), 
      },
    });
    return NextResponse.json(postSalesActivity, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
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
 *                 $ref: '#/components/schemas/PostSalesActivity' 
 */
export async function GET(req: NextRequest) {
  try {
    const verificationResult = verifyToken(req);

    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const postSalesActivities = await prisma.post_sales_activities.findMany();
    return NextResponse.json(postSalesActivities);
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
  }
}
