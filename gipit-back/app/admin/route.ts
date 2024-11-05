import { NextRequest, NextResponse } from 'next/server';
import { authorizeRole } from '@/app/api/middleware'; 

export async function GET(req: NextRequest) {
  // Solo permite acceso a usuarios con el rol "admin"
  const accessDeniedResponse = authorizeRole(req, ['admin']);
  if (accessDeniedResponse) return accessDeniedResponse;

  // Lógica para la vista de admin
  return NextResponse.json({ message: 'Bienvenido, admin' });
}
