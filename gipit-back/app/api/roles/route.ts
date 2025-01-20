import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const roles = await prisma.roles.findMany({
      select: {
        id: true,
        nombre: true,
      },
    });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: `Error al obtener roles: ${error}` }, { status: 500 });
  }
} 