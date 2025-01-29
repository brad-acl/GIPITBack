import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface TokenVerificationSuccess {
  valid: true;
  decoded: jwt.JwtPayload;
}

interface TokenVerificationError {
  valid: false;
  error: string;
}

type TokenVerificationResult =
  | TokenVerificationSuccess
  | TokenVerificationError;

// Verifica el token JWT
// export const verifyToken = (req: NextRequest): TokenVerificationResult => {
//   const token = req.headers.get("authorization")?.split(" ")[1];

//   if (!token) {
//     return { valid: false, error: "Token not provided." };
//   }

//   try {
//     const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;

//     if (!decoded || !decoded.role) {
//       return { valid: false, error: "Role not found in token." };
//     }

//     return { valid: true, decoded };
//   } catch (err) {
//     console.error(err);
//     return { valid: false, error: "Failed to authenticate token." };
//   }
// };

// Middleware principal con manejo de CORS
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
