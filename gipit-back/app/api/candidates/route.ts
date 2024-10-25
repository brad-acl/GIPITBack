import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * @swagger
 * /candidates:
 *   post:
 *     summary: Crear un nuevo candidato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               jsongpt_text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Candidato creado exitosamente
 *       500:
 *         description: Error al crear el candidato
 */
export async function POST(req: NextRequest) {
  const { name, phone, email, address, jsongpt_text } = await req.json();
  
  try {
    const candidate = await prisma.candidates.create({
      data: {
        name,
        phone,
        email,
        address,
        jsongpt_text,
      },
    });
    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
  }
}

/**
 * @swagger
 * /candidates:
 *   get:
 *     summary: Obtener todos los candidatos
 *     responses:
 *       200:
 *         description: Lista de candidatos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidate'
 */
export async function GET() {
  try {
    const candidates = await prisma.candidates.findMany();
    return NextResponse.json(candidates);
  } catch (error) {
    
    return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
  }
}
