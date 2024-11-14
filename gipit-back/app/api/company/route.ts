import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Obtener todas las compañías (GET)
/**
 * @swagger
 * /company:
 *   get:
 *     summary: Obtener todas las compañías
 *     responses:
 *       200:
 *         description: Lista de compañías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 */
export async function GET() {
  try {



    const companies = await prisma.company.findMany();
    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}

// Crear una nueva compañía (POST)
/**
 * @swagger
 * /company:
 *   post:
 *     summary: Crear una nueva compañía
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       201:
 *         description: Compañía creada exitosamente
 *       500:
 *         description: Error al crear la compañía
 */
export async function POST(req: NextRequest) {
  const { name, description } = await req.json();
  
  try {



    const company = await prisma.company.create({
      data: { name, description },
    });
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}
