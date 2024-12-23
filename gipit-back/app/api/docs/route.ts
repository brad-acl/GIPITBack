import { swaggerSpec, swaggerUi } from '../../lib/swagger';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(swaggerSpec);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export { swaggerUi as default };