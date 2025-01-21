import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * @swagger
 * /candidates/{id}:
 *   get:
 *     summary: Obtener un candidato por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del candidato
 *     responses:
 *       200:
 *         description: Información del candidato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Candidato no encontrado
 */
// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   const { id } = params;

//   try {



//     const candidate = await prisma.candidates.findUnique({
//       where: { id: parseInt(id) },
//     });

//     if (!candidate) {
//       return NextResponse.json({ error: 'Candidato no encontrado' }, { status: 404 });
//     }

//     return NextResponse.json(candidate);
//   } catch (error) {
//     return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
//   }
// }


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const candidateId = parseInt(id);

  if (isNaN(candidateId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    // Obtener el candidato y la información relevante de candidate_process
    const candidate = await prisma.candidates.findUnique({
      where: { id: candidateId },
      include: {
        candidate_process: true, // Incluir los datos de candidate_process
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidato no encontrado' }, { status: 404 });
    }

    // Extraer datos de candidate_process (tomando el primer proceso, asumiendo que hay uno solo)
    const candidateProcess = candidate.candidate_process.length > 0 ? candidate.candidate_process[0] : null;

    const notaDelCliente = candidateProcess?.client_comments
    ? JSON.parse(candidateProcess.client_comments) : '';

    const response = {
      candidateProcessId: candidateProcess?.id,
      name: candidate.name,
      match: candidateProcess?.match_percent ?? 0, // Porcentaje de compatibilidad
      // totalExperience: candidateProcess?.total_experience// Si existe una propiedad para experiencia total, aquí debes ajustarla
      email: candidate.email ?? '',
      phone: candidate.phone ?? '',
      address: candidate.address ?? '',
      sumary: candidate.jsongpt_text ?? '', // Resumen del candidato
      clientNote: {
        comment: notaDelCliente?.comment ?? '',
        techSkills: notaDelCliente?.techSkills ?? '',
        softSkills: notaDelCliente?.softSkills ?? '',
      },
      total_experience: candidate?.total_experience ?? '',
      stage: candidateProcess?.stage ?? '',
    };

    console.log("Candidate Details desde back -->", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al obtener candidato:', error);
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
  }
}

/**
 * @swagger
 * /candidates/{id}:
 *   put:
 *     summary: Actualizar un candidato
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
 *             $ref: '#/components/schemas/Candidate'
 *     responses:
 *       200:
 *         description: Candidato actualizado correctamente
 *       500:
 *         description: Error al actualizar el candidato
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { name, phone, email, address, jsongpt_text } = await req.json();

  try {



    const updatedCandidate = await prisma.candidates.update({
      where: { id: parseInt(id) },
      data: { name, phone, email, address, jsongpt_text },
    });

    return NextResponse.json(updatedCandidate);
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const candidateId = parseInt(id);

  // Validar si el ID es un número válido
  if (isNaN(candidateId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    // Verificar si el candidato existe antes de intentar eliminarlo
    const existingCandidate = await prisma.candidates.findUnique({
      where: { id: candidateId },
    });

    if (!existingCandidate) {
      return NextResponse.json({ error: 'Candidato no encontrado' }, { status: 404 });
    }

    // Primero eliminar cualquier registro relacionado en candidate_process
    await prisma.candidate_process.deleteMany({
      where: { candidate_id: candidateId },
    });

    // Luego, eliminar cualquier registro relacionado en candidate_management
    await prisma.candidate_management.deleteMany({
      where: { candidate_id: candidateId },
    });

    // Finalmente, eliminar el candidato
    await prisma.candidates.delete({
      where: { id: candidateId },
    });

    return NextResponse.json({ message: 'Candidato eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar candidato:', error);
    return NextResponse.json({ error: `Error al eliminar candidato - ${error}` }, { status: 500 });
  }
}
