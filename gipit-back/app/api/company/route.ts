import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: {
        name: "asc", // Ordenar por nombre en orden ascendente (A-Z)
      },
    });
    return NextResponse.json(companies, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching companies: ${error}` },
      { status: 500 }
    );
  }
}

// POST: Crear una nueva compañía
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validar y procesar el logo
    let logoBuffer: Buffer | null = null;
    if (data.logo) {
      try {
        // Intentar convertir el logo a Buffer
        logoBuffer = Buffer.from(data.logo);
      } catch (error) {
        throw new Error("El logo no está en un formato válido." + error);
      }
    }

    // Filtrar los datos para incluir solo los campos válidos
    const filteredData = {
      name: data.name,
      logo: logoBuffer, // Puede ser Buffer o null
      description: data.description,
    };

    // Crear la nueva compañía
    const newCompany = await prisma.company.create({
      data: filteredData,
    });

    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    // Manejo de error: verificar que sea una instancia de Error
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error creando compañía:", errorMessage);

    return NextResponse.json(
      { error: `Error creating company: ${errorMessage}` },
      { status: 500 }
    );
  }
}
