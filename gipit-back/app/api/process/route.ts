import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');  // Default to page 1
    const pageSize = 15;  // You can adjust the page size

    const processes = await prisma.process.findMany({
      skip: (page - 1) * pageSize,  // Skip previous pages
      take: pageSize,  // Limit to the page size
    });

    const total = await prisma.process.count();  // Get the total count of records

    return NextResponse.json({
      total,
      batch: processes,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching processes: ${error}` }, { status: 500 });
  }
}


// POST: Create a new process
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Filter the incoming data to include only the valid fields
    const filteredData = {
      job_offer: data.job_offer,
      job_offer_description: data.job_offer_description,
      company_id: data.company_id,
      opened_at: data.opened_at ? new Date(data.opened_at) : null,
      closed_at: data.closed_at ? new Date(data.closed_at) : null,
      pre_filtered: data.pre_filtered,
      status: data.status,
    };

    const newProcess = await prisma.process.create({
      data: filteredData,
    });

    return NextResponse.json(newProcess, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error creating process: ${error}` }, { status: 500 });
  }
}
