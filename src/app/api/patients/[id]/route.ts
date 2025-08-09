import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Patient from '@/lib/db/models/Patient'

// GET /api/patients/[id] - Get patient by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    
    // Await the params object
    const { id } = await params
    
    const patient = await Patient.findById(id).select('-__v')
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: patient
    })
  } catch (error) {
    console.error('Get patient error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/patients/[id] - Update patient
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    
    // Await the params object
    const { id } = await params
    const body = await request.json()
    
    // Basic validation
    if (body.email && !/\S+@\S+\.\S+/.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    const patient = await Patient.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).select('-__v')
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: patient
    })
  } catch (error) {
    console.error('Update patient error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/patients/[id] - Delete patient
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    
    // Await the params object
    const { id } = await params
    
    const patient = await Patient.findByIdAndDelete(id)
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Patient deleted successfully'
    })
  } catch (error) {
    console.error('Delete patient error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}