import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../middleware';

export async function GET(req: NextRequest) {
  const verificationResult = verifyToken(req);

  if (!verificationResult.valid) {
    // Return the error response if the token is invalid
    return NextResponse.json({ error: verificationResult.error }, { status: 403 });
  }

  // If token is valid, send a protected response
  return NextResponse.json({ message: 'This is a protected route.', user: verificationResult.decoded });
}
