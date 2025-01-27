import { NextResponse, NextRequest } from "next/server";
import { PrismaClient} from "@prisma/client";

//  * @swagger
//  * /users:
//  *   post:
//  *     summary: Crear un nuevo usuario
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               role:
//  *                 type: string
//  *               avatar:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Usuario creado exitosamente
//  *       500:
//  *         description: Error al crear el usuario
//  */

//  * @swagger
//  * /users:
//  *   get:
//  *     summary: Obtener todos los usuarios
//  *     responses:
//  *       200:
//  *         description: Lista de usuarios
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/User'
//  */

const prisma = new PrismaClient();

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
      management: {
        company_id: number;
      };
    };
  };
}

// GET: Obtener todos los usuarios
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const query = url.searchParams.get('query') || '';
    const role = url.searchParams.get('role') || '';
    const company = url.searchParams.get('company') || '';
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

    if (company) {
      where.users_management = {
        some: {
          management: {
            company_id: parseInt(company)
          }
        }
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
                company: true
              }
            }
          }
        }
      }
    });

    const total = await prisma.users.count({ where });

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
