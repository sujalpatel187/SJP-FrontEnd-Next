// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

interface RegisterRequest {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  companyName: string;
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, mobile, password, confirmPassword, companyName }: RegisterRequest = body;

    // Validation
    if (!name || !email || !mobile || !password || !confirmPassword || !companyName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ error: 'Mobile number must be 10 digits' }, { status: 400 });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Ensure directory exists
    const dataDir = path.join(process.cwd(), 'public', 'loginn-register');
    await fs.mkdir(dataDir, { recursive: true });

    const filePath = path.join(dataDir, 'data.txt');

    // Check if user already exists
    let existingUsers: User[] = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      existingUsers = data.trim() ? data.trim().split('\n').map(line => JSON.parse(line)) : [];
    } catch (error) {
      // File doesn't exist yet, which is fine
    }

    // Check for duplicate email
    const emailExists = existingUsers.find(user => user.email === email);
    if (emailExists) {
      return NextResponse.json({ error: 'Email already exists. Try registering with another email ID.' }, { status: 400 });
    }

    // Check for duplicate mobile number
    const mobileExists = existingUsers.find(user => user.mobile === mobile);
    if (mobileExists) {
      return NextResponse.json({ error: 'Mobile number already exists. Register with another mobile number.' }, { status: 400 });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      mobile,
      password: hashedPassword,
      companyName,
      createdAt: new Date().toISOString()
    };

    // Append to file
    await fs.appendFile(filePath, JSON.stringify(newUser) + '\n');

    // Return success (without password)
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: 'User registered successfully',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}