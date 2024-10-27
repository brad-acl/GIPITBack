import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/config'; // Adjust the path to your config file

// Middleware to verify the JWT token
const verifyToken = (req: NextRequest) => {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return { valid: false, error: 'Token not provided.' };
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    return { valid: true, decoded }; // Return success with decoded info
  } catch (err) {
    return { valid: false, error: 'Failed to authenticate token.' };
  }
};

export async function GET(req: NextRequest) {
  const verificationResult = verifyToken(req);

  if (!verificationResult.valid) {
    return NextResponse.json({ error: verificationResult.error }, { status: 403 });
  }

  // Access the user information from the decoded token
  const user = verificationResult.decoded;

  return NextResponse.json({
    message: 'This is a protected GET route.',
    user: user.username, // Example user info from token
  });
}
