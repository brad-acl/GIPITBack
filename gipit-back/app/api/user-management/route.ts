import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware'; 
const prisma = new PrismaClient();

export async function GET() {
  try {
    const userManagements = await prisma.users_management.findMany();
    return NextResponse.json(userManagements, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching user managements: ${error}` }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const data = await request.json();

    
    const filteredData = {
      user_id: data.user_id,
      management_id: data.management_id,
    };

    const newUserManagement = await prisma.users_management.create({
      data: filteredData,
    });

    return NextResponse.json(newUserManagement, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error creating user management: ${error}` }, { status: 500 });
  }
}