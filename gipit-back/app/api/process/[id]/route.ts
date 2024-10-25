import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

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
  } catch (error: unknown) {
    if (error instanceof Error) {
        if (error.message.includes('404')) {
            console.error("no encontrado (404):", error.message);
        } else if (error.message.includes('500')) {
            console.error("error de servidor (500):", error.message);
        } else {
            console.error("un error ha ocurrido:", error.message);
        }
    } else {
        console.error("un error desconocido ha ocurrido");
    }
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
    await prisma.process.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Proceso eliminado con éxito' });
    } catch (error: unknown) {
      if (error instanceof Error) {
          if (error.message.includes('404')) {
              console.error("no encontrado (404):", error.message);
          } else if (error.message.includes('500')) {
              console.error("error de servidor (500):", error.message);
          } else {
              console.error("un error ha ocurrido:", error.message);
          }
      } else {
          console.error("un error desconocido ha ocurrido");
      }
  }
}
