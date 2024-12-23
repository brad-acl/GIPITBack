import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * @swagger
 * /process/{id}:
 *   get:
 *     summary: Obtener un proceso específico
 *     description: Retorna un proceso con sus candidatos asociados y detalles
 *     tags: [Procesos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proceso
 *     responses:
 *       200:
 *         description: Proceso obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 processId:
 *                   type: integer
 *                 jobOffer:
 *                   type: string
 *                 jobOfferDescription:
 *                   type: string
 *                 stage:
 *                   type: string
 *                 candidates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       address:
 *                         type: string
 *                       jsongpt_text:
 *                         type: string
 *                       match:
 *                         type: number
 *       404:
 *         description: Proceso no encontrado
 *       500:
 *         description: Error del servidor
 * 
 *   put:
 *     summary: Actualizar un proceso
 *     description: Actualiza la información de un proceso existente
 *     tags: [Procesos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proceso a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - job_offer_description
 *             properties:
 *               job_offer_description:
 *                 type: string
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
 *         description: Proceso actualizado exitosamente
 *       400:
 *         description: Datos inválidos en la solicitud
 *       500:
 *         description: Error del servidor
 * 
 *   delete:
 *     summary: Eliminar un proceso
 *     description: Elimina un proceso y sus relaciones
 *     tags: [Procesos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proceso a eliminar
 *     responses:
 *       200:
 *         description: Proceso eliminado exitosamente
 *       500:
 *         description: Error del servidor
 */

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // Consulta para obtener el proceso y los candidatos asociados, incluyendo match_percent
    const process = await prisma.process.findUnique({
      where: { id: parseInt(id) },
      include: {
        company: {
          select: {
            name: true,
          }
        },
        candidate_process: {
          select: {
            match_percent: true,
            technical_skills: true,
            soft_skills: true,
            client_comments: true,
            interview_questions: true,
            candidates: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                jsongpt_text: true,
              },
            },
          },
        },
      },
    });

    if (!process) {
      return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 });
    }

    // Mapeo de los candidatos para incluir el campo match_percent
    const candidates = process.candidate_process.map((cp) => ({
      id: cp.candidates?.id,
      name: cp.candidates?.name,
      email: cp.candidates?.email,
      phone: cp.candidates?.phone,
      address: cp.candidates?.address,
      jsongpt_text: cp.candidates?.jsongpt_text,
      match: cp.match_percent ?? 0,
      technical_skills: cp.technical_skills,
      soft_skills: cp.soft_skills,
      client_comments: cp.client_comments,
      interview_questions: cp.interview_questions,
    }));

    // Crear la respuesta combinada del proceso y los candidatos
    return NextResponse.json({
      id: process.id,
      companyName: process.company?.name ?? 'Sin compañía',
      jobOffer: process.job_offer,
      jobOfferDescription: process.job_offer_description,
      startAt: process.opened_at,
      endAt: process.closed_at,
      preFiltered: process.pre_filtered,
      status: process.status,
      candidates,
    });
  } catch (error) {
    console.error('Error al obtener proceso:', error);
    return NextResponse.json({ error: `Error al obtener proceso: ${error}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const data = await req.json();

  try {
    // Actualizar el proceso en la base de datos con solo la descripción de la oferta de trabajo
    const updatedProcess = await prisma.process.update({
      where: { id: parseInt(id) },
      data: {
        job_offer: data.job_offer,
        job_offer_description: data.job_offer_description,
        opened_at: data.opened_at ? new Date(data.opened_at) : undefined,
        closed_at: data.closed_at ? new Date(data.closed_at) : undefined,
        pre_filtered: data.pre_filtered,
        status: data.status,
      },
    });

    return NextResponse.json(updatedProcess);
  } catch (error) {
    console.error('Error al actualizar proceso:', error);
    return NextResponse.json({ error: `Error al actualizar proceso: ${error}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const processId = parseInt(id);

  if (isNaN(processId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    // Verificar si el proceso existe
    const existingProcess = await prisma.process.findUnique({
      where: { id: processId },
      include: {
        candidate_process: true
      }
    });

    if (!existingProcess) {
      return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 });
    }

    // Usar una transacción para asegurar que todas las operaciones se completen o ninguna
    await prisma.$transaction([
      // 1. Primero eliminar las relaciones en candidate_process
      prisma.candidate_process.deleteMany({
        where: { process_id: parseInt(id) }
      }),
      // 2. Finalmente eliminar el proceso
      prisma.process.delete({
        where: { id: parseInt(id) }
      })
    ]);

    return NextResponse.json({
      message: 'Proceso y sus relaciones eliminados con éxito'
    });
  } catch (error) {
    console.error('Error al eliminar proceso:', error);
    return NextResponse.json({ error: `Error al eliminar proceso: ${error}` }, { status: 500 });
  }
}
