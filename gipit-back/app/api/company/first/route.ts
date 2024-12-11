import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const firstCompany = await prisma.company.findFirst({
      orderBy: {
        name: "asc", // Ordenar por nombre en orden ascendente (A-Z)
      },
    });
    return NextResponse.json(firstCompany, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching companies: ${error}` },
      { status: 500 }
    );
  }
}
