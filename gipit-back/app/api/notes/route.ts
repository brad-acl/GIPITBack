import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { candidate_process_id, techSkills, softSkills, comment } = await req.json();

  console.log("Datos recibidos en el backend:", {
    candidate_process_id,
    techSkills,
    softSkills,
    comment,
  });

  if (!candidate_process_id || (!techSkills && !softSkills && !comment)) {
    return NextResponse.json(
      {
        error:
          "Datos incompletos: candidate_process_id, techSkills, softSkills o comment faltantes.",
      },
      { status: 400 }
    );
  }

  try {
      // 1. Verificar si el `candidate_process_id` existe
      const existingCandidateProcess = await prisma.candidate_process.findUnique({
        where: { id: candidate_process_id },
      });
  
      if (!existingCandidateProcess) {
        return NextResponse.json(
          { error: "El candidate_process_id no existe." },
          { status: 404 }
        );
      }
  
      // 2. Validar y combinar datos existentes en `client_comments`
      let existingComments = {};
      if (existingCandidateProcess.client_comments) {
        try {
          // Intentar convertir `client_comments` existente en un objeto JSON
          existingComments = JSON.parse(existingCandidateProcess.client_comments);
        } catch (error) {
          console.error(
            "Error al parsear client_comments existente:", error,
            existingCandidateProcess.client_comments
          );
        }
      }
  
      // Combinar datos existentes con los nuevos
      const updatedComments = {
        ...existingComments,
        techSkills,
        softSkills,
        comment,
      };
  
      // 3. Actualizar `client_comments` en la base de datos
      const updatedCandidateProcess = await prisma.candidate_process.update({
        where: { id: candidate_process_id },
        data: {
          client_comments: JSON.stringify(updatedComments), // Guardar como string
        },
      });
  
      return NextResponse.json(
        { message: "Nota creada exitosamente.", updatedCandidateProcess },
        { status: 201 }
      );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error en el backend al crear la nota:", error.message);
      return NextResponse.json(
        { error: `Error al crear nota: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al crear nota." },
      { status: 500 }
    );
  }
}


export async function PUT(req: NextRequest) {
  try {
    const { candidateProcessId, techSkills, softSkills, comment } = await req.json();

    if (!candidateProcessId) {
      return NextResponse.json(
        { error: "El ID del candidato es requerido." },
        { status: 400 }
      );
    }

    // Obtener los comentarios existentes
    const existingProcess = await prisma.candidate_process.findUnique({
      where: { id: candidateProcessId },
    });

    if (!existingProcess) {
      return NextResponse.json(
        { error: "No se encontró el proceso del candidato." },
        { status: 404 }
      );
    }

    // Actualizar los campos
    const updatedComments = {
      ...(existingProcess.client_comments ? JSON.parse(existingProcess.client_comments) : {}),
      ...(techSkills && { techSkills }),
      ...(softSkills && { softSkills }),
      ...(comment && { comment }),
    };

    const updatedProcess = await prisma.candidate_process.update({
      where: { id: candidateProcessId },
      data: {
        client_comments: JSON.stringify(updatedComments),
      },
    });

    return NextResponse.json({
      message: "Nota actualizada exitosamente.",
      updatedProcess,
    });
  } catch (error) {
    console.error("Error al actualizar la nota:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}