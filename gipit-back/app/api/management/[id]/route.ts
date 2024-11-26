
import { PrismaClient } from '@prisma/client';
import {  NextResponse } from 'next/server';


const prisma = new PrismaClient();


export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const management = await prisma.management.findUnique({
      where: { id: parseInt(id) },
    });

    if (!management) {
      const notFoundResponse = NextResponse.json({ error: "Management not found" }, { status: 404 });
      notFoundResponse.headers.set("Access-Control-Allow-Origin", "*");
      notFoundResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      notFoundResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return notFoundResponse;
    }

    const response = NextResponse.json(management, { status: 200 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return response;
  } catch (error) {
    const errorResponse = NextResponse.json({ error: `Error fetching management: ${error}` }, { status: 500 });
    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    errorResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return errorResponse;
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