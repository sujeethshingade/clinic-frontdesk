import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import User from '@/lib/db/models/User'
import { AuthUtils } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    const { email, password } = body

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { message: 'Invalid email or password format' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await AuthUtils.comparePassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = AuthUtils.generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    })

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'An error occurred during login. Please try again.' },
      { status: 500 }
    )
  }
}
