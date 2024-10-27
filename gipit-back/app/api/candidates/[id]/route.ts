import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../middleware'; 

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
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const candidate = await prisma.candidates.findUnique({
      where: { id: parseInt(id) },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidato no encontrado' }, { status: 404 });
    }

    return NextResponse.json(candidate);
  } catch (error) {
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

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const updatedCandidate = await prisma.candidates.update({
      where: { id: parseInt(id) },
      data: { name, phone, email, address, jsongpt_text },
    });

    return NextResponse.json(updatedCandidate);
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
  }
}

/**
 * @swagger
 * /candidates/{id}:
 *   delete:
 *     summary: Eliminar un candidato
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Candidato eliminado correctamente
 *       500:
 *         description: Error al eliminar el candidato
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    await prisma.candidates.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Candidato eliminado con éxito' });
  } catch (error) {
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
  }
}
