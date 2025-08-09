import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import User from '@/lib/db/models/User'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    const { email, password } = body

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

    const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' })

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const token = generateToken({
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
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
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
