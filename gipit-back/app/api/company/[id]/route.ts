import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * @swagger
 * /company/{id}:
 *   get:
 *     tags: [Clientes]
 *     summary: Obtener detalles de un cliente específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente a consultar
 *     responses:
 *       200:
 *         description: Detalles del cliente obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /company/{id}:
 *   put:
 *     tags: [Clientes]
 *     summary: Actualizar información de un cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del cliente
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Logo del cliente
 *               description:
 *                 type: string
 *                 description: Descripción del cliente
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /company/{id}:
 *   delete:
 *     tags: [Clientes]
 *     summary: Eliminar un cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente a eliminar
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Company deleted successfully"
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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
    // Verificamos si la compañía existe
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
      include: {
        process: {
          include: {
            candidate_process: true
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Primero eliminamos solo las relaciones entre candidatos y procesos
    await prisma.$transaction([
      // 1. Eliminar las relaciones en candidate_process
      prisma.candidate_process.deleteMany({
        where: {
          process: {
            company_id: parseInt(id)
          }
        }
      }),
      // 2. Eliminar los procesos
      prisma.process.deleteMany({
        where: { company_id: parseInt(id) }
      }),
      // 3. Eliminar la compañía
      prisma.company.delete({
        where: { id: parseInt(id) }
      })
    ]);

    return NextResponse.json(
      { message: "Company deleted successfully. Candidates remain in the database." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: `Error deleting company: ${error}` },
      { status: 500 }
    );
  }
}
