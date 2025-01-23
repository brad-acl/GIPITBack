import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const newUserCompany = await prisma.users_company.create({
      data: {
        user_id: data.user_id,
        company_id: data.company_id,
      },
    });

    return NextResponse.json(newUserCompany, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Error creating user-company relationship: ${error}` },
      { status: 500 }
    );
  }
} 