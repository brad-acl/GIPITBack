import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * @swagger
 * /candidate_management:
 *   post:
 *     summary: Crear un nuevo registro de gestión de candidato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidate_id:
 *                 type: integer
 *               management_id:
 *                 type: integer
 *               status:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Registro de gestión de candidato creado exitosamente
 *       500:
 *         description: Error al crear el registro de gestión de candidato
 */
export async function POST(req: NextRequest) {
  const { candidate_id, management_id, status, start_date, end_date } = await req.json();

  try {
    const candidateManagement = await prisma.candidate_management.create({
      data: {
        candidate_id,
        management_id,
        status,
        start_date,
        end_date,
      },
    });
    return NextResponse.json(candidateManagement, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating candidate management record' }, { status: 500 });
  }
}

/**
 * @swagger
 * /candidate_management:
 *   get:
 *     summary: Obtener todos los registros de gestión de candidatos
 *     responses:
 *       200:
 *         description: Lista de registros de gestión de candidatos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CandidateManagement'
 */
export async function GET() {
  try {
    const candidateManagementRecords = await prisma.candidate_management.findMany();
    return NextResponse.json(candidateManagementRecords);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching candidate management records' }, { status: 500 });
  }
}
