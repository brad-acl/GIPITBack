import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * Obtener todos los registros de gestión de candidatos
 */
export async function GET() {
  try {
    // Realizamos la consulta incluyendo las relaciones 'management' y 'candidates'
    const candidateManagementRecords = await prisma.candidate_management.findMany({
      include: {
        management: true,
        candidates: true,
      },
    });

    // Verificamos que los datos estén correctamente incluidos
    console.log("Registros de gestión de candidatos:", candidateManagementRecords);

    // Mapeamos los datos y extraemos solo lo necesario
    const mappedRecords = candidateManagementRecords.map(record => {
      console.log("Record individual:", record);  // Añadido para verificar el contenido de cada registro
      return {
        id: record.id,  // Verificamos si 'id' está presente
        name: record.candidates?.name,  // 'name' de 'candidates'
        role: record.position,  // 'position' como 'role'
        client: record.management?.name,  // 'name' de 'management'
        start: record.start_date,  // 'start_date' como 'start'
        end: record.end_date,  // 'end_date' como 'end'
        status: record.status,  // 'status' como 'state'
        rate: record.rate,
      };
    });

    // Devolvemos los registros mapeados como respuesta
    return NextResponse.json(mappedRecords);
  } catch (error) {
    console.error("Error al obtener los registros:", error);
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}