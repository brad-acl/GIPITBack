import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(
  req: Request,
  {
    params,
  }: { params: { id: string; name: string; role: string; email: string } }
) {
  const { id } = params;

  try {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "El usuario no existe" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error fetching company: ${error.message}` },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: `Error fetching company: ${error}` },
        { status: 500 }
      );
    }
  }
}
