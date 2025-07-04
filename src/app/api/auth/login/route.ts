// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface LoginRequest {
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  companyName: string;
  createdAt: string;
}

// You should store this in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password }: LoginRequest = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Read users from file
    const filePath = path.join(process.cwd(), 'public', 'loginn-register', 'data.txt');
    let users: User[] = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      users = data.trim() ? data.trim().split('\n').map(line => JSON.parse(line)) : [];
    } catch (error) {
      return NextResponse.json({ error: 'No users found. Please register first.' }, { status: 400 });
    }

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.name,
        companyName: user.companyName
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success (without password)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}