import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
  const { name, phone, email, address, jsongpt_text } = await req.json();

  try {


    const candidate = await prisma.candidates.create({
      data: {
        name,
        phone,
        email,
        address,
        jsongpt_text,
      },
    });
    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}

export async function GET() {
  try {


    const candidates = await prisma.candidates.findMany();
    return NextResponse.json(candidates);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}
