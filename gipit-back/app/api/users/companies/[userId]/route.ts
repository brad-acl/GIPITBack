import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /users/companies/{userId}:
 *   get:
 *     summary: Obtener las compañías asociadas a un usuario por ID de usuario
 *     tags: [Administración de Usuarios]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de compañías del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 *       500:
 *         description: Error al obtener las compañías del usuario
 */

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);

    console.log('Fetching companies for userId:', userId);

    const userCompanies = await prisma.users_company.findMany({
      where: {
        user_id: userId
      },
      include: {
        company: true
      }
    });

    console.log('User Companies Found:', userCompanies);

    return NextResponse.json(userCompanies);
  } catch (error) {
    console.error('Error obteniendo compañías del usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener compañías del usuario' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';