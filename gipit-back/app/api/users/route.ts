import { NextResponse, NextRequest } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

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

// export async function POST(req: NextRequest) {
//   try {
//     // Verificación opcional de token solo si se envía
//     const tokenVerificationResult = verifyToken(req);
//     if (tokenVerificationResult.valid === false && tokenVerificationResult.error !== 'Token not provided.') {
//       return NextResponse.json({ error: tokenVerificationResult.error }, { status: 403 });
//     }

//     const { name, email, role, avatar } = await req.json();
//     const user = await prisma.users.create({
//       data: { name, email, role, avatar },
//     });

//     // Genera un token para el nuevo usuario basado en su rol
//     const token = jwt.sign({ userId: user.id, role: user.role }, jwtSecret, { expiresIn: '1h' });

//     return NextResponse.json({ ...user, token }, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ error: `Error creating user - ${error}` }, { status: 500 });
//   }
// }

// GET: Obtener todos los usuarios
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const query = searchParams.get('query') || '';
    const role = searchParams.get('role') || '';

    const whereClause = {
        AND: [
            {
                OR: [
                    { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
                    { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
                    { position: { contains: query, mode: Prisma.QueryMode.insensitive } },
                ],
            },
            role ? { roles: { nombre: role } } : {},
        ],
    };

    const pageSize = 15;

    if (page < 1) {
      return NextResponse.json({ error: 'El número de página debe ser mayor que 0.' }, { status: 400 });
    }

    const [users, total] = await Promise.all([
        prisma.users.findMany({
          where: whereClause,
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
              roles: {
                  select: {
                      nombre: true,
                  },
              },
          },
        }),
        prisma.users.count({
            where: whereClause,
        }),
    ]);

    return NextResponse.json({ total, users }, { status: 200 });
}

// POST: Crear un nuevo usuario
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Filtrar los datos para incluir solo los campos válidos
    const filteredData = {
      name: data.name,
      email: data.email,
      role_id: data.role_id,
      position: data.position,
    };

    const newUser = await prisma.users.create({
      data: filteredData,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Error creating user: ${error}` },
      { status: 500 }
    );
  }
}
