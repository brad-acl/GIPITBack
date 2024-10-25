import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * @swagger
 * /post_sales_activities/{id}:
 *   get:
 *     summary: Obtener una actividad de ventas por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la actividad de ventas
 *     responses:
 *       200:
 *         description: Información de la actividad de ventas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostSalesActivity'
 *       404:
 *         description: Actividad de ventas no encontrada
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const postSalesActivity = await prisma.post_sales_activities.findUnique({
      where: { id: parseInt(id) },
    });

    if (!postSalesActivity) {
      return NextResponse.json({ error: 'Actividad de ventas no encontrada' }, { status: 404 });
    }

    return NextResponse.json(postSalesActivity);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo la actividad de ventas' }, { status: 500 });
  }
}

/**
 * @swagger
 * /post_sales_activities/{id}:
 *   put:
 *     summary: Actualizar una actividad de ventas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostSalesActivity'
 *     responses:
 *       200:
 *         description: Actividad de ventas actualizada correctamente
 *       500:
 *         description: Error al actualizar la actividad de ventas
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { candidate_management_id, benefit, description, date, associated_cost } = await req.json();

  try {
    const updatedPostSalesActivity = await prisma.post_sales_activities.update({
      where: { id: parseInt(id) },
      data: {
        candidate_management_id,
        benefit,
        description,
        date,
        associated_cost,
        updated_at: new Date(), // Automatically update the timestamp
      },
    });

    return NextResponse.json(updatedPostSalesActivity);
  } catch (error) {
    return NextResponse.json({ error: 'Error actualizando la actividad de ventas' }, { status: 500 });
  }
}

/**
 * @swagger
 * /post_sales_activities/{id}:
 *   delete:
 *     summary: Eliminar una actividad de ventas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Actividad de ventas eliminada correctamente
 *       500:
 *         description: Error al eliminar la actividad de ventas
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await prisma.post_sales_activities.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Actividad de ventas eliminada con éxito' });
  } catch (error) {
    return NextResponse.json({ error: 'Error eliminando la actividad de ventas' }, { status: 500 });
  }
}
