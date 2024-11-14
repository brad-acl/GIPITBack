import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    try {



        const user = await prisma.users.findUnique({
            where: { id: parseInt(id) },
        });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `Error fetching user ${error}` }, { status: 500 });
    }
}

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar un usuario
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       500:
 *         description: Error al actualizar el usuario
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const { name, email, role, avatar } = await req.json();

    try {



        const updatedUser = await prisma.users.update({
            where: { id: parseInt(id) },
            data: { name, email, role, avatar },
        });
        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `Error updating user - ${error}` }, { status: 500 });
    }
}

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       500:
 *         description: Error al eliminar el usuario
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    try {



        await prisma.users.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ message: 'User deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `Error deleting user - ${error}` }, { status: 500 });
    }
}
