import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error fetching company: ${error.message}` },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: `Error fetching company: ${error}` },
        { status: 500 }
      );
    }
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const data = await req.json();

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
      logo: logoBuffer,
      description: data.description,
    };

    const updatedCompany = await prisma.company.update({
      where: { id: parseInt(id) },
      data: filteredData,
    });

    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error) {
    console.error("Error updating company:", error);

    return NextResponse.json(
      { error: `Error updating company: ${error}` },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar una compañía por ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await prisma.company.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "Company deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Error deleting company: ${error}` },
      { status: 500 }
    );
  }
}
