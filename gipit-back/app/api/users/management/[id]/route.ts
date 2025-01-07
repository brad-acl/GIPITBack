// En tu API backend (users/management/[id])
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);

    const userManagements = await prisma.users_management.findMany({
      where: {
        user_id: userId
      },
      include: {
        management: {
          include: {
            company: true
          }
        }
      }
    });

    return NextResponse.json(userManagements);
  } catch (error) {
    console.error('Error fetching user managements:', error);
    return NextResponse.json(
      { error: 'Error fetching user managements' },
      { status: 500 }
    );
  }
}