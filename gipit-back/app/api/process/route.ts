import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = 15;

    console.log(`Fetching processes for page: ${page}`);

    if (page < 1) {
      return NextResponse.json({ error: 'Page number must be greater than 0.' }, { status: 400 });
    }

    const processes = await prisma.process.findMany({
      skip: (page - 1) * pageSize, 
      take: pageSize, 
    });

    const total = await prisma.process.count();

    console.log(`Returning ${processes.length} processes for page ${page}`);

    return NextResponse.json({
      total,
      batch: processes,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching processes:', error);
    return NextResponse.json({ error: `Error  - ${error}` }, { status: 500 });
  }
}




export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Received data from frontend:", data);

    const filteredData = {
      job_offer: data.job_offer,
      job_offer_description: data.job_offer_description,
      company_id: data.company_id,
      opened_at: data.opened_at ? new Date(data.opened_at) : null,
      closed_at: data.closed_at ? new Date(data.closed_at) : null,
      pre_filtered: data.pre_filtered,
      status: data.status,
    };

    console.log("Filtered data for Prisma:", filteredData);

    const newProcess = await prisma.process.create({
      data: filteredData,
    });

    console.log("Created new process:", newProcess);

    return NextResponse.json(newProcess, { status: 201 });
  } catch (error) {
    console.error("Error creating process:", error);
    return NextResponse.json({ error: `Error  - ${error}` }, { status: 500 });
  }
}
