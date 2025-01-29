import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * @swagger
 * /user-company:
 *   post:
 *     summary: Crear una nueva relación entre usuario y compañía
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
 *               company_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Relación usuario-compañía creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserCompany'
 *       400:
 *         description: user_id y company_id son requeridos
 *       404:
 *         description: Usuario o compañía no encontrados
 *       500:
 *         description: Error al crear la relación usuario-compañía
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { user_id, company_id } = data;

    // Validar que user_id y company_id sean proporcionados
    if (!user_id || !company_id) {
      return NextResponse.json(
        { error: "Both user_id and company_id are required" },
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

    // Verificar que la compañía exista
    const companyExists = await prisma.company.findUnique({
      where: { id: company_id },
    });
    if (!companyExists) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Crear la relación users_company
    const newUserCompany = await prisma.users_company.create({
      data: {
        user_id,
        company_id,
      },
    });

    return NextResponse.json(newUserCompany, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Error creating user-company relationship: ${error}` },
      { status: 500 }
    );
  }
}