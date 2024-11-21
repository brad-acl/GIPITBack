import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; 


const prisma = new PrismaClient();




export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Este id es el management_id

  try {
    // Busca todos los registros de user_management asociados al management_id
    const userManagements = await prisma.users_management.findMany({
      where: { management_id: parseInt(id) }, // Filtra por management_id
      include: {
        users: true, // Incluye los detalles del usuario relacionado
      },
    });

    // Si no hay registros, devuelve un array vacío
    if (!userManagements || userManagements.length === 0) {
      const response = NextResponse.json([], { status: 200 });
      response.headers.set("Access-Control-Allow-Origin", "*");
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return response;
    }

    // Mapea los registros para devolver solo los datos relevantes
    const integrantes = userManagements.map((um) => ({
      id: um.id, // ID del registro en users_management
      name: um.users?.name || "Usuario Desconocido",
      email: um.users?.email || "No disponible",
      role: um.users?.role || "No asignado",
      management_id: um.management_id,
    }));

    const response = NextResponse.json(integrantes, { status: 200 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return response;
  } catch (error) {
    console.error("Error fetching user management:", error);
    const errorResponse = NextResponse.json({ error: `Error fetching user management: ${error}` }, { status: 500 });
    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    errorResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return errorResponse;
  }
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const data = await req.json();

    
    const filteredData = {
      user_id: data.user_id,
      management_id: data.management_id,
    };

    const updatedUserManagement = await prisma.users_management.update({
      where: { id: parseInt(id) },
      data: filteredData,
    });

    return NextResponse.json(updatedUserManagement, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error updating user management: ${error}` }, { status: 500 });
  }
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await prisma.users_management.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: "User management deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error deleting user management: ${error}` }, { status: 500 });
  }
}