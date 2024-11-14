import { PrismaClient } from '@prisma/client';
import {  NextResponse } from 'next/server';


const prisma = new PrismaClient();


export async function GET() {
  try {
    const companies = await prisma.company.findMany();
    return NextResponse.json(companies, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching companies: ${error}` }, { status: 500 });
  }
}

// POST: Crear una nueva compañía
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Filtrar los datos para incluir solo los campos válidos
    const filteredData = {
      name: data.name,
      logo: data.logo,
      description: data.description,
    };

    const newCompany = await prisma.company.create({
      data: filteredData,
    });

    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error creating company: ${error}` }, { status: 500 });
  }
}