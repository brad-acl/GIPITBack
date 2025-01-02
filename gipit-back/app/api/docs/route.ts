import { swaggerSpec } from '../../lib/swagger';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
