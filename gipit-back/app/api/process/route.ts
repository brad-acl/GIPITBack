import { Prisma, PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * @swagger
 * /process:
 *   get:
 *     summary: Obtener lista de todos los procesos
 *     description: Retorna una lista paginada de todos los procesos con sus candidatos asociados
 *     tags: [Procesos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página para la paginación
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *         description: ID de la compañía para filtrar procesos
 *     responses:
 *       200:
 *         description: Lista de procesos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 batch:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       jobOfferDescription:
 *                         type: string
 *                       startAt:
 *                         type: string
 *                       endAt:
 *                         type: string
 *                       preFiltered:
 *                         type: integer
 *                       candidates:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       stage:
 *                         type: string
 *                       candidatesIds:
 *                         type: array
 *                         items:
 *                           type: integer
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error del servidor
 * 
 *   post:
 *     summary: Crear un nuevo proceso
 *     description: Crea un nuevo proceso de selección
 *     tags: [Procesos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - job_offer
 *               - company_id
 *             properties:
 *               job_offer:
 *                 type: string
 *                 description: Título de la oferta de trabajo
 *               job_offer_description:
 *                 type: string
 *                 description: Descripción detallada de la oferta
 *               company_id:
 *                 type: integer
 *                 description: ID de la compañía asociada
 *               opened_at:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de apertura del proceso
 *               closed_at:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de cierre del proceso
 *               pre_filtered:
 *                 type: boolean
 *                 description: Indica si el proceso está pre-filtrado
 *               status:
 *                 type: string
 *                 description: Estado actual del proceso
 *     responses:
 *       201:
 *         description: Proceso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Process'
 *       500:
 *         description: Error del servidor
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    console.log("URL completa recibida:", req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const query = url.searchParams.get('query') || '';
    const companyId = url.searchParams.get('companyId') || '';
    const managementId = url.searchParams.get("managementId");
    const status = url.searchParams.get('status') || '';
    const userRole = url.searchParams.get('userRole') || ''; // Nuevo parámetro
    const userCompanyId = url.searchParams.get('userCompanyId') || ''; // Nuevo parámetro
    const pageSize = 15;


    console.log(`Compania seleccionada filtro: ${companyId}`);
    console.log(`Obteniendo procesos para la página: ${page}`);

    if (page < 1) {
      return NextResponse.json({ error: 'El número de página debe ser mayor que 0.' }, { status: 400 });
    }

    // Construir la cláusula `where` para los filtros
    const where: Prisma.processWhereInput = {};

    if (userRole === 'client' && userCompanyId) {
      where.management = {
        company_id: parseInt(userCompanyId),
      };
    }

    // Agregar el filtro de `query` si está presente
    if (query) {
      where.job_offer = {
        contains: query,
        mode: Prisma.QueryMode.insensitive, // Búsqueda sin sensibilidad a mayúsculas/minúsculas
      };
    }
    
    // Agregar el filtro de `companyId` si está presente
    // Filtro por `companyId`
    if (companyId) {
      where.management = {
        company_id: parseInt(companyId),
      };
    }

    if (managementId) {
      where.management_id = parseInt(managementId);
    }
    
    // Agregar el filtro de `status` si está presente
    if (status) {
      where.status = status;
    }

    const processes = await prisma.process.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where, // Aplicar la cláusula `where` para filtrar
      include: {
        _count: {
          select: { candidate_process: true }, // Cuenta los candidatos asociados
        },
        candidate_process: {
          select: { candidate_id: true }, // Opcional: selecciona solo IDs si los necesitas
        },
        management: {
          select: {
            name: true, // Nombre de la jefatura
            company: {
              select: { name: true }, // Nombre de la compañía asociada
            },
          },
        },
      },
    });

    console.log(processes);

    const total = await prisma.process.count({ where }); // Filtra también el total si hay búsqueda

    // Transformamos los datos para devolverlos en el formato requerido
    const batch = processes.map((process) => ({
      id: process.id,
      name: process.job_offer,
      jobOfferDescription: process.job_offer_description,
      startAt: process?.opened_at && process?.opened_at !== null ? new Date(process.opened_at).toLocaleDateString() : null,
      endAt: process?.closed_at && process?.closed_at !== null ? new Date(process.closed_at).toLocaleDateString() : null,
      preFiltered: process.pre_filtered ? 1 : 0,
      candidates: process._count.candidate_process || 0,
      status: process?.status ?? "Pendiente",
      stage: "Entrevistas", // Valor predeterminado para 'stage'
      company: process.management?.company?.name || 'Sin compañía',      
      management: process.management?.name || 'Sin jefatura',
      candidatesIds: process.candidate_process.map((cp) => cp.candidate_id) ?? [], // IDs de candidatos
    }));


    // console.log(`Devolviendo ${processes.length} procesos para la página ${page}`);
    console.log(`Filtros recibidos: query=${query}, status=${status}, companyId=${companyId}`);


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

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Verificar si la compañía existe antes de crear el proceso
    // const companyExists = await prisma.company.findUnique({
    //   where: { id: data.company_id }
    // });
        // Validar si el management existe antes de crear el proceso
    const managementId = Number(data.managementId);
    if (isNaN(managementId)) {
      return NextResponse.json(
        { error: "El management_id es requerido y debe ser un número válido." },
        { status: 400 }
      );
    }

    // Verificar si la jefatura (management) existe
    const managementExists = await prisma.management.findUnique({
      where: { id: managementId },
      include: { company: true },
    });

    if (!managementExists) {
      return NextResponse.json(
        { error: `La jefatura con ID ${managementId} no existe.` },
        { status: 404 }
      );
    }

    const filteredData = {
      job_offer: data.job_offer,
      job_offer_description: data.job_offer_description,
      management_id: managementId,
      opened_at: data.opened_at ? new Date(data.opened_at) : new Date(), // Usa la fecha actual si no se proporciona
      closed_at: data.closed_at ? new Date(data.closed_at) : null,
      pre_filtered: data.pre_filtered,
      status: data.status,
    };

    const newProcess = await prisma.process.create({
      data: filteredData,
      include: {
        management: {
          include: { company: true }, // Incluir la compañía para retornar información adicional
        },
      },
    });

    return NextResponse.json(newProcess, { status: 201 });
  } catch (error) {
    console.error("Error al crear proceso:", error);
    return NextResponse.json(
      { error: `Error al crear proceso: ${error}` },
      { status: 500 }
    );
  }
}
