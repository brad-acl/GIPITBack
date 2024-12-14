import jwt from "jsonwebtoken";

export const createJWT = (
  id: number,
  name: string,
  role: string,
  email: string
) => {
  const secretKey = process.env.JWT_SECRET;

  // Datos del payload
  const payload = {
    id: id,
    name: name,
    role: role,
    email: email,
  };

  // Generar el token
  let token: string = "";
  if (secretKey) {
    token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
  }

  console.log("Token generado:", token);
};
