import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../middleware'; 

const prisma = new PrismaClient();



export async function GET(request: Request) {
  try {
    // Obtener los parámetros de la URL
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    // Verificar si se proporcionó company_id
    if (companyId) {
      // Convertir companyId a número
      const companyIdNumber = parseInt(companyId, 10);

      // Consultar las gestiones que pertenecen al company_id proporcionado
      const filteredManagements = await prisma.management.findMany({
        where: {
          company_id: companyIdNumber,
        },
      });

      return NextResponse.json(filteredManagements, { status: 200 });
    }

    // Si no se proporciona company_id, devolver todas las gestiones
    const managements = await prisma.management.findMany();
    return NextResponse.json(managements, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching managements: ${error}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

   
    const filteredData = {
      company_id: data.company_id,
      name: data.name,
      description: data.description,
    };

    const newManagement = await prisma.management.create({
      data: filteredData,
    });

    return NextResponse.json(newManagement, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error creating management: ${error}` }, { status: 500 });
  }
}