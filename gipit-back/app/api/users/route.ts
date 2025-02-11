import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Administración de Usuarios]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página para paginación
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar usuarios por nombre, email o posición
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtrar usuarios por rol
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filtrar usuarios por ID de compañía
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Error al obtener los usuarios
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Administración de Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role_id:
 *                 type: integer
 *               position:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Error al crear el usuario
 */

interface WhereClause {
  OR?: {
    name?: { contains: string; mode: 'insensitive' };
    email?: { contains: string; mode: 'insensitive' };
    position?: { contains: string; mode: 'insensitive' };
  }[];
  roles?: {
    nombre: string;
  };
  users_management?: {
    some: {
      id?: number;
      company_id?: number;
    };
  };
  users_company?: {
    some: {
      company_id: number
    }
  }
}

// GET: Obtener todos los usuarios
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const query = url.searchParams.get('query') || '';
    const role = url.searchParams.get('role') || '';
    const companyId = url.searchParams.get('companyId') || '';
    const managementId = url.searchParams.get('managementId') || '';  // Nuevo filtro
    const pageSize = 15;
    

    const where: WhereClause = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { position: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.roles = {
        nombre: role
      };
    }

    // Filtro por jefatura o compañía
    // if (managementId || companyId) {
    //   where.users_management = {
    //     some: {
    //       ...(managementId && { id: parseInt(managementId) }),
    //       ...(companyId && { company_id: parseInt(companyId) }),
    //     },
    //   };


    // }
    console.log(managementId);
      // Filtro adicional para usuarios vinculados directamente a la compañía (por `users_company`)
      if (companyId) {
        where.users_company = {
          some: {
            company_id: parseInt(companyId),
          },
        };
      }

    const users = await prisma.users.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      include: {
        roles: true,
        users_management: {
          include: {
            management: {
              include: {
                company: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        users_company: {
          include: {
            company: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    const total = await prisma.users.count({ where });

    console.log("Usuarios filtrados ->", users);

    return NextResponse.json({
      users,
      total
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching users: ${error}` },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo usuario
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validar que el role_id sea válido
    if (!data.role_id) {
      data.role_id = 6; // Asignar rol de cliente por defecto si no se especifica
    }

    // Filtrar los datos para incluir solo los campos válidos
    const filteredData = {
      name: data.name,
      email: data.email,
      role_id: data.role_id,
      position: data.position,
    };

    const newUser = await prisma.users.create({
      data: filteredData,
      include: {
        roles: true // Incluir información del rol en la respuesta
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Error creating user: ${error}` },
      { status: 500 }
    );
  }
}