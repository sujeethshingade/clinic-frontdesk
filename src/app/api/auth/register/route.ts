import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import User from '@/lib/db/models/User'
import { AuthUtils } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { firstName, lastName, email, password, role } = body

    // Basic validation
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (typeof firstName !== 'string' || firstName.trim().length < 2) {
      return NextResponse.json(
        { message: 'First name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    if (typeof lastName !== 'string' || lastName.trim().length < 2) {
      return NextResponse.json(
        { message: 'Last name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    if (!['admin', 'receptionist', 'doctor', 'patient'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role selected' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(password)

    // Create new user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    })

    await user.save()

    // Generate JWT token
    const token = AuthUtils.generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    })

    return NextResponse.json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    )
  }
}
