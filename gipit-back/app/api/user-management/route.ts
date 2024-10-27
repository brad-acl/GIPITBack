import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware'; 
const prisma = new PrismaClient();

/**
 * @swagger
 * /users_management:
 *   post:
 *     summary: Crear una relación usuario-management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserManagement'
 *     responses:
 *       201:
 *         description: Relación creada exitosamente
 *       500:
 *         description: Error al crear la relación
 */
export async function POST(req: NextRequest) {
  try {
    const verificationResult = verifyToken(req);

    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const { user_id, management_id } = await req.json();
    const userManagement = await prisma.users_management.create({
      data: { user_id, management_id },
    });
    return NextResponse.json(userManagement, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error creating user-management relation - ${error}` }, { status: 500 });
  }
}

/**
 * @swagger
 * /users_management:
 *   get:
 *     summary: Obtener todas las relaciones usuario-management
 *     responses:
 *       200:
 *         description: Lista de relaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserManagement'
 */
export async function GET(req: NextRequest) {
  try {
    const verificationResult = verifyToken(req);

    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const usersManagement = await prisma.users_management.findMany();
    return NextResponse.json(usersManagement, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching user-management relations - ${error}` }, { status: 500 });
  }
}
