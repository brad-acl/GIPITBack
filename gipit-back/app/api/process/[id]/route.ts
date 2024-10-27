import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../middleware'; 

const prisma = new PrismaClient();

/**
 * @swagger
 * /process/{id}:
 *   get:
 *     summary: Obtener un proceso por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proceso
 *     responses:
 *       200:
 *         description: Información del proceso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Process'
 *       404:
 *         description: Proceso no encontrado
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const process = await prisma.process.findUnique({
      where: { id: parseInt(id) },
    });

    if (!process) {
      return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 });
    }

    return NextResponse.json(process);
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
  }
}

/**
 * @swagger
 * /process/{id}:
 *   put:
 *     summary: Actualizar un proceso
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
 *             type: object
 *             properties:
 *               job_offer:
 *                 type: string
 *               job_offer_description:
 *                 type: string
 *               company_id:
 *                 type: integer
 *               opened_at:
 *                 type: string
 *                 format: date-time
 *               closed_at:
 *                 type: string
 *                 format: date-time
 *               pre_filtered:
 *                 type: boolean
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proceso actualizado correctamente
 *       404:
 *         description: Proceso no encontrado
 *       500:
 *         description: Error al actualizar el proceso
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { job_offer, job_offer_description, company_id, opened_at, closed_at, pre_filtered, status } = await req.json();

  try {

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const updatedProcess = await prisma.process.update({
      where: { id: parseInt(id) },
      data: {
        job_offer,
        job_offer_description,
        company_id,
        opened_at,
        closed_at,
        pre_filtered,
        status,
      },
    });

    return NextResponse.json(updatedProcess);
  } catch (error) {
    console.error("Error al actualizar el proceso:", error);
    return NextResponse.json({ error: `Error actualizando el proceso - ${error}` }, { status: 500 });
  }
}

/**
 * @swagger
 * /process/{id}:
 *   delete:
 *     summary: Eliminar un proceso
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proceso eliminado correctamente
 *       404:
 *         description: Proceso no encontrado
 *       500:
 *         description: Error al eliminar el proceso
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    await prisma.process.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Proceso eliminado con éxito' });
  } catch (error) {
    console.error("Error al eliminar el proceso:", error);
    return NextResponse.json({ error: `Error eliminando el proceso - ${error}` }, { status: 500 });
  }
}
