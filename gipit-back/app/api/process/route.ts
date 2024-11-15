import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Parse the page parameter from the query string (defaults to 1 if not provided)
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = 15;

    // Debugging log: Print out the page number for validation
    console.log(`Fetching processes for page: ${page}`);

    // Ensure page is not less than 1
    if (page < 1) {
      return NextResponse.json({ error: 'Page number must be greater than 0.' }, { status: 400 });
    }

    // Get processes from the database with pagination
    const processes = await prisma.process.findMany({
      skip: (page - 1) * pageSize,  // Skipping previous pages
      take: pageSize,  // Limiting to the page size
    });

    // Get the total number of processes (to calculate pagination)
    const total = await prisma.process.count();

    // Debugging log: Print out the number of processes being returned
    console.log(`Returning ${processes.length} processes for page ${page}`);

    // Return the total number of processes and the current batch of processes
    return NextResponse.json({
      total,
      batch: processes,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching processes:', error);
    return NextResponse.json({ error: `Error fetching processes: ${error.message}` }, { status: 500 });
  }
}




export async function POST(request: NextRequest) {
  try {
    // Log the incoming request data
    const data = await request.json();
    console.log("Received data from frontend:", data);

    // Filter and structure the data to be saved
    const filteredData = {
      job_offer: data.job_offer,
      job_offer_description: data.job_offer_description,
      company_id: data.company_id,
      opened_at: data.opened_at ? new Date(data.opened_at) : null,
      closed_at: data.closed_at ? new Date(data.closed_at) : null,
      pre_filtered: data.pre_filtered,
      status: data.status,
    };

    // Log filtered data before saving to the database
    console.log("Filtered data for Prisma:", filteredData);

    // Create a new process in the database
    const newProcess = await prisma.process.create({
      data: filteredData,
    });

    // Log the result of the database operation
    console.log("Created new process:", newProcess);

    return NextResponse.json(newProcess, { status: 201 });
  } catch (error) {
    console.error("Error creating process:", error);
    return NextResponse.json({ error: `Error creating process: ${error.message}` }, { status: 500 });
  }
}
