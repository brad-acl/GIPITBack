import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const userManagements = await prisma.users_management.findMany();
    return NextResponse.json(userManagements, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching user managements: ${error}` }, { status: 500 });
  }
}



export async function POST(req: Request) {
  try {
    const { user_id, management_id} = await req.json();

    // Validar que user_id y management_id sean válidos
    if (!user_id || !management_id) {
      return NextResponse.json(
        { error: "Both user_id and management_id are required" },
        { status: 400 }
      );
    }

    // Verificar que el usuario exista
    const userExists = await prisma.users.findUnique({
      where: { id: user_id },
    });
    if (!userExists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verificar que la jefatura exista
    const managementExists = await prisma.management.findUnique({
      where: { id: management_id },
    });
    if (!managementExists) {
      return NextResponse.json(
        { error: "Management not found" },
        { status: 404 }
      );
    }

    // Crear el registro de users_management
    const userManagement = await prisma.users_management.create({
      data: {
        user_id,
        management_id,
        
      },
    });

    return NextResponse.json(userManagement, { status: 201 });
  } catch (error) {
    console.error("Error creating user-management:", error);
    return NextResponse.json(
      { error: `Error creating user-management: ${error}` },
      { status: 500 }
    );
  }
}