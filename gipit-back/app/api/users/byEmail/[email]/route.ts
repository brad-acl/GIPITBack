import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { email: string } }
) {
  const { email } = params;
  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching user: ${error}` },
      { status: 500 }
    );
  }
}
