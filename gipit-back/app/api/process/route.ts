import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../middleware'; 

const prisma = new PrismaClient();

/**
 * @swagger
 * /process:
 *   post:
 *     summary: Crear un nuevo proceso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               job_offer:
 *                 type: string
 *               job_offer_description:
 *                 type: string
 *               company_id:
 *                 type: integer
 *               opened_at:
 *                 type: string
 *                 format: date-time
 *               closed_at:
 *                 type: string
 *                 format: date-time
 *               pre_filtered:
 *                 type: boolean
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Proceso creado exitosamente
 *       500:
 *         description: Error al crear el proceso
 */
export async function POST(req: NextRequest) {
  try {
    const verificationResult = verifyToken(req);

    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const { job_offer, job_offer_description, company_id, opened_at, closed_at, pre_filtered, status } = await req.json();

    const process = await prisma.process.create({
      data: {
        job_offer,
        job_offer_description,
        company_id,
        opened_at: opened_at ? new Date(opened_at) : null,
        closed_at: closed_at ? new Date(closed_at) : null,
        pre_filtered,
        status,
      },
    });
    return NextResponse.json(process, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error creating process - ${error}` }, { status: 500 });
  }
}

/**
 * @swagger
 * /process:
 *   get:
 *     summary: Obtener todos los procesos
 *     responses:
 *       200:
 *         description: Lista de procesos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Process'
 */
export async function GET(req: NextRequest) {
  try {
    const verificationResult = verifyToken(req);

    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.error }, { status: 403 });
    }

    const processes = await prisma.process.findMany();
    return NextResponse.json(processes);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching processes - ${error}` }, { status: 500 });
  }
}
