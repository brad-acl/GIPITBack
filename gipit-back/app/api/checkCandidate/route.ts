import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * Verifica si un candidato con un correo electrónico o número de teléfono ya está asociado a un proceso.
 *
 * @param req - La solicitud HTTP.
 * @returns Respuesta JSON indicando si el candidato ya está asociado.
 */
export async function POST(req: NextRequest) {
  try {
    const { processId, email, phone } = await req.json();

    // Validar parámetros requeridos
    if (!processId || (!email && !phone)) {
      return NextResponse.json(
        { error: "El processId, email y/o phone son requeridos." },
        { status: 400 }
      );
    }

    // Construir las condiciones de búsqueda eliminando valores nulos o indefinidos
    const orConditions: Array<{ candidates: { email?: string; phone?: string } }> = [];
    if (email) orConditions.push({ candidates: { email } });
    if (phone) orConditions.push({ candidates: { phone } });

    // Buscar el candidato en el proceso
    const existingCandidate = await prisma.candidate_process.findFirst({
      where: {
        process_id: parseInt(processId, 10),
        OR: orConditions, // Condiciones válidas
      },
      include: {
        candidates: true,
      },
    });

    if (existingCandidate) {
      return NextResponse.json(
        {
          exists: true,
          message: "El candidato ya está asociado al proceso.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        exists: false,
        message: "El candidato no está asociado al proceso.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al verificar el candidato:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}