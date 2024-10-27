import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../api/config/config';

interface TokenVerificationSuccess {
  valid: true;
  decoded: string | jwt.JwtPayload;
}

interface TokenVerificationError {
  valid: false;
  error: string;
}

// Union type for the verification result
type TokenVerificationResult = TokenVerificationSuccess | TokenVerificationError;

export const verifyToken = (req: NextRequest): TokenVerificationResult => {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return { valid: false, error: 'Token not provided.' };
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    return { valid: true, decoded }; // Return success
  } catch (err) {
    console.error(err); // Log the error
    return { valid: false, error: 'Failed to authenticate token.' }; // Return error
  }
}  