import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../middleware'; 

const prisma = new PrismaClient();

// Obtener todos los registros de management (GET)
/**
 * @swagger
 * /management:
 *   get:
 *     summary: Obtener todos los registros de management
 *     responses:
 *       200:
 *         description: Lista de registros de management
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Management'
 */
export async function GET(req: NextRequest) {
  try {
    // Verify JWT token
    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const managements = await prisma.management.findMany();
    return NextResponse.json(managements);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching managements - ${error}` }, { status: 500 });
  }
}

// Crear un nuevo registro de management (POST)
/**
 * @swagger
 * /management:
 *   post:
 *     summary: Crear un nuevo registro de management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Management'
 *     responses:
 *       201:
 *         description: Registro de management creado exitosamente
 *       500:
 *         description: Error al crear el registro de management
 */
export async function POST(req: NextRequest) {
  const { company_id, name, description } = await req.json();

  try {

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const management = await prisma.management.create({
      data: { company_id, name, description },
    });
    return NextResponse.json(management, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error creating management - ${error}` }, { status: 500 });
  }
}

// Actualizar un registro de management (PUT)
export async function PUT(req: NextRequest) {
  const { id, name, description } = await req.json();

  try {

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const management = await prisma.management.update({
      where: { id: parseInt(id) },
      data: { name, description },
    });
    return NextResponse.json(management);
  } catch (error) {
    return NextResponse.json({ error: `Error updating management - ${error}` }, { status: 500 });
  }
}

// Eliminar un registro de management (DELETE)
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  try {

    const verificationResult = verifyToken(req);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    await prisma.management.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Management deleted' }, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: `Error deleting management - ${error}` }, { status: 500 });
  }
}
