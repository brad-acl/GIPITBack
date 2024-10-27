import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../middleware'; 
const prisma = new PrismaClient();

/**
 * @swagger
 * /company/{id}:
 *   get:
 *     summary: Obtener una compañía por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la compañía
 *     responses:
 *       200:
 *         description: Información de la compañía
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Compañía no encontrada
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
    });

    if (!company) {
      return NextResponse.json({ error: 'Compañía no encontrada' }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ error: `Error obteniendo la compañía - ${error}` }, { status: 500 });
  }
}

/**
 * @swagger
 * /company/{id}:
 *   put:
 *     summary: Actualizar una compañía
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
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       200:
 *         description: Compañía actualizada correctamente
 *       500:
 *         description: Error al actualizar la compañía
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { name, logo, description } = await req.json();

  try {

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: parseInt(id) },
      data: { name, logo, description },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    return NextResponse.json({ error: `Error actualizando la compañía - ${error}` }, { status: 500 });
  }
}

/**
 * @swagger
 * /company/{id}:
 *   delete:
 *     summary: Eliminar una compañía
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compañía eliminada correctamente
 *       500:
 *         description: Error al eliminar la compañía
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    await prisma.company.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Compañía eliminada con éxito' });
  } catch (error) {
    return NextResponse.json({ error: `Error eliminando la compañía - ${error}` }, { status: 500 });
  }
}
