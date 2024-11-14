import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; 


const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const userManagement = await prisma.users_management.findUnique({
      where: { id: parseInt(id) },
    });
    if (!userManagement) return NextResponse.json({ error: "User management not found" }, { status: 404 });
    return NextResponse.json(userManagement, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching user management: ${error}` }, { status: 500 });
  }
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const data = await req.json();

    
    const filteredData = {
      user_id: data.user_id,
      management_id: data.management_id,
    };

    const updatedUserManagement = await prisma.users_management.update({
      where: { id: parseInt(id) },
      data: filteredData,
    });

    return NextResponse.json(updatedUserManagement, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error updating user management: ${error}` }, { status: 500 });
  }
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await prisma.users_management.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: "User management deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error deleting user management: ${error}` }, { status: 500 });
  }
}