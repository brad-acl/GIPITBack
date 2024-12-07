import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (req.method === "OPTIONS") {
    // Manejo de preflight request
    const response = new Response(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return response;
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
    });

    if (!company) {
      const notFoundResponse = NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
      // Configurar encabezados CORS en caso de error
      notFoundResponse.headers.set("Access-Control-Allow-Origin", "*");
      notFoundResponse.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      notFoundResponse.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      return notFoundResponse;
    }

    const response = NextResponse.json(company, { status: 200 });

    // Configurar encabezados CORS en caso de éxito
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return response;
  } catch (error) {
    console.error("Error fetching company:", error);

    const errorResponse = NextResponse.json(
      { error: `Error fetching company: ${error}` },
      { status: 500 }
    );

    // Configurar encabezados CORS también en caso de error
    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    errorResponse.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    errorResponse.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return errorResponse;
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

    const response = NextResponse.json(updatedCompany, { status: 200 });

    // Configurar los encabezados CORS
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return response;
  } catch (error) {
    console.error("Error updating company:", error);

    const errorResponse = NextResponse.json(
      { error: `Error updating company: ${error}` },
      { status: 500 }
    );

    // Configurar los encabezados CORS también en caso de error
    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    errorResponse.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    errorResponse.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return errorResponse;
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
