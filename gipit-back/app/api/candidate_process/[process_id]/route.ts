import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { process_id: string } }) {
  // Verificación del process_id
  if (!params || !params.process_id) {
    return NextResponse.json({ error: 'Missing process_id parameter' }, { status: 400 });
  }

  const process_id = params.process_id;

  if (isNaN(Number(process_id))) {
    return NextResponse.json({ error: 'Invalid process_id parameter' }, { status: 400 });
  }

  try {
    // Consulta para traer el proceso con los candidatos asociados
    const proceso = await prisma.process.findUnique({
      where: { id: parseInt(process_id) },
      include: {
        candidate_process: {
          include: {
            candidates: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!proceso) {
      return NextResponse.json({ error: 'Proceso no encontrado.' }, { status: 404 });
    }

    // Transformar los datos para que incluyan los detalles de los candidatos, el porcentaje de compatibilidad (`match_percent`) y total_exp
    const response = {
      id: proceso.id,
      name: proceso.job_offer,
      startAt: proceso.opened_at ? new Date(proceso.opened_at).toLocaleDateString() : '',
      endAt: proceso.closed_at ? new Date(proceso.closed_at).toLocaleDateString() : null,
      preFiltered: proceso.pre_filtered ? 1 : 0,
      candidates: proceso.candidate_process.map((cp) => ({
        id: cp.candidates?.id,
        name: cp.candidates?.name,
        phone: cp.candidates?.phone,
        email: cp.candidates?.email,
        address: cp.candidates?.address,
        match: cp.match_percent ?? 0, // Añadir el porcentaje de compatibilidad desde candidate_process
        stage: cp.stage ?? 'entrevistas'
      })),
      state: proceso.status ?? 'pending',
    };

    

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: `Server Error - ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}

// export async function GET(req: NextRequest) {
//   const process_id = req.nextUrl.searchParams.get('process_id'); 

//   if (!process_id || isNaN(Number(process_id))) {
//     return NextResponse.json({ error: 'Invalid or missing process_id query parameter' }, { status: 400 });
//   }

//   try {
//     const candidateProcesses = await prisma.candidate_process.findMany({
//       where: {
//         process_id: parseInt(process_id), 
//       },
//       include: {
//         candidates: true,  
//         process: true,   
//       },
//     });

//     if (candidateProcesses.length === 0) {
//       return NextResponse.json({ error: 'No candidate processes found for this process.' }, { status: 404 });
//     }

//     return NextResponse.json(candidateProcesses);
//   } catch (error: unknown) {  
//     if (error instanceof Error) {
//       return NextResponse.json({ error: `Server Error - ${error.message}` }, { status: 500 });
//     }
//     return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
//   }
// }



// export async function PUTActualizarCandidateProcess(req: NextRequest, { params }: { params: { id: string } }) {
//   const { id } = params;
//   const { candidate_ids, technical_skills, soft_skills, client_comments, match_percent, interview_questions } = await req.json();

//   try {
//     const existingCandidateProcess = await prisma.candidate_process.findUnique({
//       where: { id: parseInt(id) },
//     });

//     if (!existingCandidateProcess) {
//       return NextResponse.json({ error: 'No se encontró la asociación Candidate-Process' }, { status: 404 });
//     }

//     const updatedCandidateProcess = await prisma.candidate_process.update({
//       where: { id: parseInt(id) },
//       data: { technical_skills, soft_skills, client_comments, match_percent, interview_questions },
//     });

//     // Manejar la adición de nuevos candidatos si se proporcionan
//     if (candidate_ids && candidate_ids.length > 0) {
//       const addedCandidates = await Promise.all(
//         candidate_ids.map(async (candidateId: number) => {
//           const candidate = await prisma.candidates.findUnique({
//             where: { id: candidateId },
//           });

//           if (!candidate) {
//             throw new Error(`Candidato con ID ${candidateId} no encontrado`);
//           }

//           return prisma.candidate_process.create({
//             data: {
//               candidate_id: candidateId,
//               process_id: parseInt(id),
//             },
//           });
//         })
//       );

//       return NextResponse.json({
//         message: 'Candidate-Process actualizado y candidatos agregados con éxito',
//         updatedCandidateProcess,
//         addedCandidates,
//       });
//     } else {
//       return NextResponse.json({
//         message: 'Candidate-Process actualizado con éxito',
//         updatedCandidateProcess,
//       });
//     }
//   } catch (error) {
//     return NextResponse.json({ error: `Error al actualizar candidate_process: ${error}` }, { status: 500 });
//   }
// }

export async function DELETE(req: NextRequest, { params }: { params: { process_id: string } }) {
  const { process_id } = params;

  if (isNaN(Number(process_id))) {
    return NextResponse.json({ error: 'Invalid process_id parameter' }, { status: 400 });
  }

  try {
    await prisma.candidate_process.deleteMany({
      where: { process_id: parseInt(process_id) },
    });

    return NextResponse.json({ message: 'Candidate-Process associations deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: `Error - ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}

// DESCALIFICAR CANDIDATO
// export async function PUTDescalificarCandidatos(req: NextRequest, { params }: { params: { process_id: string } }) {
//   const { process_id } = params;
//     const { candidateId } = await req.json();
  
//     if (!candidateId) {
//       return NextResponse.json({ error: 'Missing candidateId parameter' }, { status: 400 });
//     }
  
//     try {
//       // Convertir process_id a número
//       const processIdNumber = parseInt(process_id, 10);
  
//       // Actualizar el campo stage en la tabla candidate_process a "descartado"
//       await prisma.candidate_process.updateMany({
//         where: {
//           candidate_id: candidateId,
//           process_id: processIdNumber,
//         },
//         data: { stage: "descartado" },
//       });
  
//       return NextResponse.json({ message: 'Candidato descalificado con éxito' });
//     } catch (error) {
//       return NextResponse.json({ error: `Error al descalificar el candidato: ${error}` }, { status: 500 });
//     }
//   }

  // SELECCIONAR CANDIDATO
// export async function PUTseleccionarCandidato(req: NextRequest, { params }: { params: { process_id: string } }) {
//   const { process_id } = params;
//   const { candidateId } = await req.json();

//   if (!candidateId) {
//     return NextResponse.json({ error: 'Missing candidateId parameter' }, { status: 400 });
//   }

//   try {
//     // Convertir process_id a número
//     const processIdNumber = parseInt(process_id, 10);

//     // Actualizar el campo stage en la tabla candidate_process a "descartado"
//     await prisma.candidate_process.updateMany({
//       where: {
//         candidate_id: candidateId,
//         process_id: processIdNumber,
//       },
//       data: { stage: "seleccionado" },
//     });

//     return NextResponse.json({ message: 'Candidato descalificado con éxito' });
//   } catch (error) {
//     return NextResponse.json({ error: `Error al descalificar el candidato: ${error}` }, { status: 500 });
//   }
// }


// Modificaciones de CANDIDATO EN PROCESO / seleccionar / descartar
export async function PUT(req: NextRequest, { params }: { params: { process_id: string } }) {
  const { process_id } = params;
  const { action, candidateId, data } = await req.json();

  if (!action || !candidateId) {
    return NextResponse.json({ error: 'Los parámetros "action" y "candidateId" son requeridos' }, { status: 400 });
  }

  try {
    const processIdNumber = parseInt(process_id, 10);
    if (isNaN(processIdNumber)) {
      return NextResponse.json({ error: 'El parámetro "process_id" debe ser un número válido' }, { status: 400 });
    }

    switch (action) {
      case 'edit': {
        // Aquí se reutiliza tu método PUTActualizarCandidateProcess
        const { candidate_ids, technical_skills, soft_skills, client_comments, match_percent, interview_questions } = data;

        const existingCandidateProcess = await prisma.candidate_process.findUnique({
          where: { id: parseInt(candidateId) },
        });

        if (!existingCandidateProcess) {
          return NextResponse.json({ error: 'No se encontró la asociación Candidate-Process' }, { status: 404 });
        }

        const updatedCandidateProcess = await prisma.candidate_process.update({
          where: { id: parseInt(candidateId) },
          data: { technical_skills, soft_skills, client_comments, match_percent, interview_questions },
        });

        // Manejo de candidatos adicionales
        if (candidate_ids && candidate_ids.length > 0) {
          const addedCandidates = await Promise.all(
            candidate_ids.map(async (candidateId: number) => {
              const candidate = await prisma.candidates.findUnique({
                where: { id: candidateId },
              });

              if (!candidate) {
                throw new Error(`Candidato con ID ${candidateId} no encontrado`);
              }

              return prisma.candidate_process.create({
                data: {
                  candidate_id: candidateId,
                  process_id: processIdNumber,
                },
              });
            })
          );

          return NextResponse.json({
            message: 'Candidate-Process actualizado y candidatos agregados con éxito',
            updatedCandidateProcess,
            addedCandidates,
          });
        } else {
          return NextResponse.json({
            message: 'Candidate-Process actualizado con éxito',
            updatedCandidateProcess,
          });
        }
      }

      case 'disqualify': {
        await prisma.candidate_process.updateMany({
          where: {
            candidate_id: candidateId,
            process_id: processIdNumber,
          },
          data: { stage: 'descartado' },
        });

        return NextResponse.json({ message: 'Candidato descalificado con éxito' });
      }

      case 'back-interview': {
        await prisma.candidate_process.updateMany({
          where: {
            candidate_id: candidateId,
            process_id: processIdNumber,
          },
          data: { stage: 'entrevistas' },
        });

        return NextResponse.json({ message: 'Candidato descalificado con éxito' });
      }

      case 'select': {
        await prisma.candidate_process.updateMany({
          where: {
            candidate_id: candidateId,
            process_id: processIdNumber,
          },
          data: { stage: 'seleccionado' },
        });

        return NextResponse.json({ message: 'Candidato seleccionado con éxito' });
      }

      default:
        return NextResponse.json({ error: `Acción no reconocida: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error(`Error en la operación "${action}":`, error);
    return NextResponse.json({ error: `Error en la operación "${action}" - ${error}` }, { status: 500 });
  }
}