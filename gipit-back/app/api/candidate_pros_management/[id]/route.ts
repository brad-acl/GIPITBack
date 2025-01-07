import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * @swagger
 * /candidate_management/{id}:
 *   get:
 *     summary: Obtener un registro de gestión de candidato por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro de gestión de candidato
 *     responses:
 *       200:
 *         description: Información del registro de gestión de candidato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidateManagement'
 *       404:
 *         description: Registro de gestión de candidato no encontrado
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // Buscamos el registro de candidate_management con el id especificado
    const candidateManagement = await prisma.candidate_management.findUnique({
      where: {
        id: parseInt(id), // Convierte el id a entero
      },
      include: {
        candidates: { // Información del candidato
          select: {
            name: true, // Nombre del candidato
            email: true, // Correo del candidato
            phone: true, // Teléfono del candidato (si existe)
            address: true, // Dirección del candidato (si existe)
          },
        },
        post_sales_activities: {  // Incluimos las actividades de post venta
          select: {
            date: true,
            eval_stack: true,         // Evaluación de stack
            eval_comunicacion: true, // Evaluación de comunicación
            eval_motivacion: true,   // Evaluación de motivación
            eval_cumplimiento: true, // Evaluación de cumplimiento
          },
        },
      },
    });

    // Si no se encuentra el registro, devolvemos un error 404
    if (!candidateManagement) {
      return NextResponse.json({ error: 'Registro de gestión de candidato no encontrado' }, { status: 404 });
    }

    // Si encontramos el registro, lo devolvemos como respuesta
    return NextResponse.json(candidateManagement);

  } catch (error) {
    // En caso de error, devolvemos un error 500 con el mensaje correspondiente
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
  }
}
/**
 * @swagger
 * /candidate_management/{id}:
 *   put:
 *     summary: Actualizar un registro de gestión de candidato
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
 *             $ref: '#/components/schemas/CandidateManagement'
 *     responses:
 *       200:
 *         description: Registro de gestión de candidato actualizado correctamente
 *       500:
 *         description: Error al actualizar el registro de gestión de candidato
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { candidate_id, management_id, status, start_date, end_date } = await req.json();

  try {



    const updatedCandidateManagement = await prisma.candidate_management.update({
      where: { id: parseInt(id) },
      data: {
        candidate_id,
        management_id,
        status,
        start_date,
        end_date,
        updated_at: new Date(), // Automatically update the timestamp
      },
    });

    return NextResponse.json(updatedCandidateManagement);
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
  }
}

/**
 * @swagger
 * /candidate_management/{id}:
 *   delete:
 *     summary: Eliminar un registro de gestión de candidato
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Registro de gestión de candidato eliminado correctamente
 *       500:
 *         description: Error al eliminar el registro de gestión de candidato
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {



    await prisma.candidate_management.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Registro de gestión de candidato eliminado con éxito' });
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
  }
}
