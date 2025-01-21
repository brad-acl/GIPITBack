import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(id) },
      include: {
        roles: {
          select: {
            nombre: true,
          },
        },
      },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching user: ${error}` },
      { status: 500 }
    );
  }
}

// PUT: Actualizar un usuario por ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const data = await req.json();

    // Filtrar los datos para incluir solo los campos válidos
    const filteredData = {
      name: data.name,
      email: data.email,
      position: data.position,
      is_active: data.is_active,
    };

    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: filteredData,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Error actualizando usuario: ${error}` },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar un usuario por ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    await prisma.users.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Error deleting user: ${error}` },
      { status: 500 }
    );
  }
}
