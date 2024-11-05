

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../api/config/config';

interface TokenVerificationSuccess {
  valid: true;
  decoded: jwt.JwtPayload;
}

interface TokenVerificationError {
  valid: false;
  error: string;
}

type TokenVerificationResult = TokenVerificationSuccess | TokenVerificationError;

export const verifyToken = (req: NextRequest): TokenVerificationResult => {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return { valid: false, error: 'Token not provided.' };
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;

    if (!decoded || !decoded.role) {
      return { valid: false, error: 'Role not found in token.' };
    }

    return { valid: true, decoded };
  } catch (err) {
    console.error(err);
    return { valid: false, error: 'Failed to authenticate token.' };
  }
};

// Middleware function to validate role-based access
export const authorizeRole = (req: NextRequest, allowedRoles: string[]): NextResponse | undefined => {
  const verificationResult = verifyToken(req);

  if (!verificationResult.valid) {
    return NextResponse.json({ error: verificationResult.error }, { status: 403 });
  }

  const { role } = verificationResult.decoded;
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Access denied: insufficient permissions' }, { status: 403 });
  }

  return undefined; // Allows access if role is authorized
};