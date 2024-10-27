import jwt from 'jsonwebtoken';
import { jwtSecret, jwtExpiresIn } from './config';

export const generateToken = (username: string): string => {
  const payload = {
    username, // Include any relevant user information
    timestamp: Date.now(),
  };

  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
};
