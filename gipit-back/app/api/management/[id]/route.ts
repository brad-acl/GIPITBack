import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * Obtener una gestión por ID
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {


    const management = await prisma.management.findUnique({
      where: { id: parseInt(id) },
    });

    if (!management) {
      return NextResponse.json({ error: 'Gestión no encontrada' }, { status: 404 });
    }

    return NextResponse.json(management);
  } catch (error) {
    return NextResponse.json({ error: `Error obteniendo la gestión - ${error}` }, { status: 500 });
  }
}

/**
 * Actualizar una gestión
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { company_id, name, description } = await req.json();

  try {



    const updatedManagement = await prisma.management.update({
      where: { id: parseInt(id) },
      data: { company_id, name, description },
    });

    return NextResponse.json(updatedManagement);
  } catch (error) {
    return NextResponse.json({ error: `Error actualizando la gestión - ${error}` }, { status: 500 });
  }
}

/**
 * Eliminar una gestión
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {



    await prisma.management.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Gestión eliminada con éxito' });
  } catch (error) {
    return NextResponse.json({ error: `Error eliminando la gestión - ${error}` }, { status: 500 });
  }
}
