import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Count all processes in the database
    const processCount = await prisma.process.count();  

    // Return the count as a JSON response
    return NextResponse.json({
      totalProcesses: processCount,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching process count: ${error.message}` }, { status: 500 });
  }
}
