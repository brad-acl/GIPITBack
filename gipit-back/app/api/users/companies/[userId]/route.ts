import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);

    console.log('Fetching companies for userId:', userId);

    const userCompanies = await prisma.users_company.findMany({
      where: {
        user_id: userId
      },
      include: {
        company: true
      }
    });

    console.log('User Companies Found:', userCompanies);

    return NextResponse.json(userCompanies);
  } catch (error) {
    console.error('Error obteniendo compañías del usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener compañías del usuario' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';