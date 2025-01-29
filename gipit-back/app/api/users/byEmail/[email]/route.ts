import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /users/byEmail/{email}:
 *   get:
 *     summary: Obtener un usuario por su email
 *     tags: [Administración de Usuarios]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al obtener el usuario
 */

export async function GET(
  req: Request,
  { params }: { params: { email: string } }
) {
  const { email } = params;
  try {
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching user: ${error}` },
      { status: 500 }
    );
  }
}