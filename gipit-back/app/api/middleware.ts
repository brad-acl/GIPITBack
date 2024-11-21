
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../api/config/config";

interface TokenVerificationSuccess {
  valid: true;
  decoded: jwt.JwtPayload;
}

interface TokenVerificationError {
  valid: false;
  error: string;
}

type TokenVerificationResult = TokenVerificationSuccess | TokenVerificationError;

// Verifica el token JWT
export const verifyToken = (req: NextRequest): TokenVerificationResult => {
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return { valid: false, error: "Token not provided." };
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;

    if (!decoded || !decoded.role) {
      return { valid: false, error: "Role not found in token." };
    }

    return { valid: true, decoded };
  } catch (err) {
    console.error(err);
    return { valid: false, error: "Failed to authenticate token." };
  }
};

// Middleware principal con manejo de CORS
export function middleware(req: NextRequest) {
  
  const response = NextResponse.next();

  // Configuración de CORS
  const origin = req.headers.get("origin");
  const allowedOrigins = ["http://localhost:3000"]; // Orígenes permitidos

  if (req.method === "OPTIONS") {
    // Responde a preflight requests
    response.headers.set(
      "Access-Control-Allow-Origin",
      allowedOrigins.includes(origin || "") ? origin! : "*"
    );
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    return response;
  }

  // Configura los encabezados de CORS para otras solicitudes
  response.headers.set(
    "Access-Control-Allow-Origin",
    allowedOrigins.includes(origin || "") ? origin! : "*"
  );
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}

export const config = {
  matcher: "/api/:path*", // Aplica el middleware a las rutas /api
};

