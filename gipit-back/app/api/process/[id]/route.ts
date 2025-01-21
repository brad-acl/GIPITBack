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
    // Consulta para obtener el proceso, la jefatura y la compañía asociada
    const process = await prisma.process.findUnique({
      where: { id: parseInt(id) },
      include: {
        management: { // Relación con la jefatura
          include: {
            company: { // Relación con la compañía a través de management
              select: {
                name: true,
              },
            },
          },
        },
        candidate_process: { // Relación con los candidatos
          select: {
            match_percent: true,
            stage: true,
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

    // Mapeo de los candidatos para incluir `match_percent` y otros datos
    const candidates = process.candidate_process.map((cp) => ({
      id: cp.candidates?.id,
      name: cp.candidates?.name,
      email: cp.candidates?.email,
      phone: cp.candidates?.phone,
      address: cp.candidates?.address,
      jsongpt_text: cp.candidates?.jsongpt_text,
      match: cp.match_percent ?? 0,
      stage: cp.stage ?? 'entrevistas',
    }));

    // Crear la respuesta combinada del proceso, compañía, y candidatos
    return NextResponse.json({
      id: process.id,
      companyName: process.management?.company?.name ?? 'Sin compañía',
      managementName: process.management?.name ?? 'Sin jefatura',
      jobOffer: process.job_offer,
      jobOfferDescription: process.job_offer_description,
      stage: 'Entrevistas',
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
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'ID inválido o faltante' }, { status: 400 });
    }

    if (data.action === "close") {
      // Obtener el proceso con su management y candidatos seleccionados
      const process = await prisma.process.findUnique({
        where: { id: parseInt(id) },
        include: {
          management: true,
          candidate_process: {
            where: {
              stage: "seleccionado"
            },
            include: {
              candidates: true
            }
          }
        }
      });

      if (!process) {
        return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 });
      }

      // Crear candidate_management para cada candidato seleccionado
      const candidateManagementPromises = process.candidate_process.map(cp => 
        prisma.candidate_management.create({
          data: {
            candidate_id: cp.candidate_id!,
            management_id: process.management_id!,
            status: "Activo",
            start_date: new Date(),
            position: process.job_offer // Usar el nombre del cargo del proceso
          }
        })
      );

      // Ejecutar todas las operaciones en una transacción
      await prisma.$transaction([
        // Crear los registros de candidate_management
        ...candidateManagementPromises,
        // Actualizar el proceso a cerrado
        prisma.process.update({
          where: { id: parseInt(id) },
          data: {
            status: "Cerrado",
            closed_at: new Date(),
          }
        })
      ]);

      return NextResponse.json({
        message: "Proceso cerrado y candidatos seleccionados convertidos a profesionales exitosamente",
        route: "/process"
      });
    }

    // Resto del código para otras actualizaciones...
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
