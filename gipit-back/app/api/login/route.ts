import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '../config/tokenGenerator';

const mockUser = {
  username: 'testUser',
  password: 'testPassword', // Hardcoded password
};

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  // Check hardcoded credentials
  if (username === mockUser.username && password === mockUser.password) {
    const token = generateToken(username);
    return NextResponse.json({ token });
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
