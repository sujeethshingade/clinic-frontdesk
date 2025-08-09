import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  
  // Dummy authentication - in a real app, you'd verify against a database
  if (email && password) {
    const user = {
      id: '1',
      email: email,
      name: 'Demo User'
    }
    
    const token = 'dummy-jwt-token-' + Date.now()
    
    return NextResponse.json({
      success: true,
      user,
      token
    })
  }
  
  return NextResponse.json({
    success: false,
    message: 'Invalid credentials'
  }, { status: 401 })
}
