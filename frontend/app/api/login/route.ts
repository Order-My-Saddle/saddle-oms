import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = formData.get('username');
  const password = formData.get('password');

  // Mock authentication logic
  if (username === 'admin' && password === 'password123') {
    // In real life, generate a JWT or session token here
    return NextResponse.json({ success: true, token: 'mock-token-123' });
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
