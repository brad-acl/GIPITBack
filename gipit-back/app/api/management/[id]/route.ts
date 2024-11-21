
import { PrismaClient } from '@prisma/client';
import {  NextResponse } from 'next/server';


const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
 
  const { id } = params;
  try {
    const management = await prisma.management.findUnique({
      where: { id: parseInt(id) },
    });
    if (!management) return NextResponse.json({ error: "Management not found" }, { status: 404 });
    return NextResponse.json(management, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching management: ${error}` }, { status: 500 });
  }
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const data = await req.json();

   
    const filteredData = {
      company_id: data.company_id,
      name: data.name,
      description: data.description,
    };

    const updatedManagement = await prisma.management.update({
      where: { id: parseInt(id) },
      data: filteredData,
    });

    return NextResponse.json(updatedManagement, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error updating management: ${error}` }, { status: 500 });
  }
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await prisma.management.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: "Management deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error deleting management: ${error}` }, { status: 500 });
  }
}