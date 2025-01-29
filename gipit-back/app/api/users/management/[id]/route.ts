// En tu API backend (users/management/[id])
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * @swagger
 * /users/management/{id}:
 *   get:
 *     summary: Obtener las administraciones de usuarios por ID de usuario
 *     tags: [AdministraciÃ³n de Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
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
 *         description: Error al obtener las administraciones de usuarios
 */

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);

    const userManagements = await prisma.users_management.findMany({
      where: {
        user_id: userId
      },
      include: {
        management: {
          include: {
            company: true
          }
        }
      }
    });

    return NextResponse.json(userManagements);
  } catch (error) {
    console.error('Error fetching user managements:', error);
    return NextResponse.json(
      { error: 'Error fetching user managements' },
      { status: 500 }
    );
  }
}