import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = 15;

    console.log(`Obteniendo procesos para la página: ${page}`);

    if (page < 1) {
      return NextResponse.json({ error: 'El núme ro de página debe ser mayor que 0.' }, { status: 400 });
    }

    // Actualizamos la consulta para incluir los candidatos asociados
    const processes = await prisma.process.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: {
          select: { candidate_process: true }, // Cuenta la relación candidate_process
        },
        candidate_process: {
          select: { candidate_id: true }, // Opcional: selecciona solo IDs si los necesitas
        },
      },
    });

    const total = await prisma.process.count();

    // Transformamos los datos para devolverlos en el formato requerido
    const batch = processes.map((process) => ({
      id: process.id,
      name: process.job_offer,
      jobOfferDescription: process.job_offer_description,
      startAt: process.opened_at ? new Date(process.opened_at).toLocaleDateString() : '',
      endAt: process.closed_at ? new Date(process.closed_at).toLocaleDateString() : null,
      preFiltered: process.pre_filtered ? 1 : 0,
      candidates: process._count.candidate_process || 0,
      status: process.status ?? "Pendiente",
      stage: "Entrevistas(default)", // Valor predeterminado para 'stage'
      candidatesIds: process.candidate_process.map((cp) => cp.candidate_id) ?? [], // IDs de candidatos
    }));


    console.log(`Devolviendo ${processes.length} procesos para la página ${page}`);

    console.log('Devolviendo el back fetch process:', batch);
    return NextResponse.json({
      total,
      batch,
    }, { status: 200 });
  } catch (error) {
    console.error('Error al recuperar proceso:', error);
    return NextResponse.json({ error: `Error al recuperar proceso: ${error}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Datos recibidos del frontend:", data);

    const filteredData = {
      job_offer: data.job_offer,
      job_offer_description: data.job_offer_description,
      company_id: data.company_id,
      opened_at: data.opened_at ? new Date(data.opened_at) : null,
      closed_at: data.closed_at ? new Date(data.closed_at) : null,
      pre_filtered: data.pre_filtered,
      status: data.status,
    };

    console.log("Datos filtrados para Prisma:", filteredData);

    const newProcess = await prisma.process.create({
      data: filteredData,
    });

    console.log("Nuevo proceso creado:", newProcess);

    return NextResponse.json(newProcess, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error al postear proceso: ${error}` }, { status: 500 });
  }
}
