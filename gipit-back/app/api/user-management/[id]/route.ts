import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; 

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {



    const userManagement = await prisma.users_management.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!userManagement) {
      return NextResponse.json({ error: 'Relation not found' }, { status: 404 });
    }

    return NextResponse.json(userManagement, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching relation - ${error}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { user_id, management_id } = await req.json();

  try {



    const updatedRelation = await prisma.users_management.update({
      where: { id: parseInt(id) },
      data: { user_id, management_id },
    });

    return NextResponse.json(updatedRelation, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error updating relation - ${error}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {



    await prisma.users_management.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Relation deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error deleting relation - ${error}` }, { status: 500 });
  }
}
