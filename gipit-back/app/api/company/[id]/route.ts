import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../middleware'; 
const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
    });
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
    return NextResponse.json(company, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching company: ${error}` }, { status: 500 });
  }
}

// PUT: Actualizar una compañía por ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const data = await req.json();

    // Filtrar los datos para incluir solo los campos válidos
    const filteredData = {
      name: data.name,
      logo: data.logo,
      description: data.description,
    };

    const updatedCompany = await prisma.company.update({
      where: { id: parseInt(id) },
      data: filteredData,
    });

    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error updating company: ${error}` }, { status: 500 });
  }
}

// DELETE: Eliminar una compañía por ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await prisma.company.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: "Company deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error deleting company: ${error}` }, { status: 500 });
  }
}