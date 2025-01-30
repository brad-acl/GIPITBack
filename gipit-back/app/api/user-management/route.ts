import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /user-management:
 *   get:
 *     summary: Obtener lista de todas las administraciones de usuarios
 *     tags: [Administración de Usuarios]
 *     responses:
 *       200:
 *         description: Lista de administraciones de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserManagement'
 *       500:
 *         description: Error al procesar la solicitud
 *   post:
 *     summary: Crear una nueva administración de usuarios
 *     tags: [Administración de Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               management_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Administración de usuarios creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserManagement'
 *       400:
 *         description: user_id y management_id son requeridos
 *       404:
 *         description: Usuario o administración no encontrados
 *       500:
 *         description: Error al crear la administración de usuarios
 */
export async function GET() {
  try {
    const userManagements = await prisma.users_management.findMany();
    return NextResponse.json(userManagements, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching user managements: ${error}` }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user_id, management_id } = await req.json();

    // Validar que user_id y management_id sean válidos
    if (!user_id || !management_id) {
      return NextResponse.json(
        { error: "Both user_id and management_id are required" },
        { status: 400 }
      );
    }

    // Verificar que el usuario exista
    const userExists = await prisma.users.findUnique({
      where: { id: user_id },
    });
    if (!userExists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verificar que la administración exista
    const managementExists = await prisma.management.findUnique({
      where: { id: management_id },
    });
    if (!managementExists) {
      return NextResponse.json(
        { error: "Management not found" },
        { status: 404 }
      );
    }

    // Crear el registro de users_management
    const userManagement = await prisma.users_management.create({
      data: {
        user_id,
        management_id,
      },
    });

    return NextResponse.json(userManagement, { status: 201 });
  } catch (error) {
    console.error("Error creating user-management:", error);
    return NextResponse.json(
      { error: `Error creating user-management: ${error}` },
      { status: 500 }
    );
  }
}