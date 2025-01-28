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
        users_company: {
          include: {
            company: true
          }
        },
        users_management: {
          include: {
            management: {
              include: {
                company: true
              }
            }
          }
        }
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
    console.log('Datos recibidos:', data);
    const userId = parseInt(id);
    
    // Obtener el usuario actual para verificar su rol anterior
    const currentUser = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        users_management: true,
        users_company: true
      }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Cliente-Gerente a Cliente (role_id: 6 -> 2)
    if (currentUser.role_id === 6 && data.role_id === 2) {
      // Eliminar relación users_company
      await prisma.users_company.deleteMany({
        where: { user_id: userId }
      });

      // Si se proporciona management_id, crear relación users_management
      if (data.management_id) {
        await prisma.users_management.create({
          data: {
            user_id: userId,
            management_id: parseInt(data.management_id)
          }
        });
      }
    }

    // Cliente a Cliente-Gerente (role_id: 2 -> 6)
    if (currentUser.role_id === 2 && data.role_id === 6) {
      // Eliminar relación users_management
      await prisma.users_management.deleteMany({
        where: { user_id: userId }
      });

      // Crear relación users_company
      if (data.company_id) {
        await prisma.users_company.create({
          data: {
            user_id: userId,
            company_id: parseInt(data.company_id)
          }
        });
      }
    }

    // Actualizar usuario
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        position: data.position,
        is_active: data.is_active,
        role_id: data.role_id
      }
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error completo:', error);
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
