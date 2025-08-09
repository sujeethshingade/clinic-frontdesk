import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Doctor from '@/lib/db/models/Doctor'

// GET /api/doctors/[id] - Get doctor by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    
    // Await the params object
    const { id } = await params
    
    const doctor = await Doctor.findById(id).select('-__v')
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      doctor: doctor
    })
  } catch (error) {
    console.error('Get doctor error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/doctors/[id] - Update doctor
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
    
    // Check for duplicate email or license number if being updated
    if (body.email || body.licenseNumber) {
      const existingDoctor = await Doctor.findOne({
        _id: { $ne: id },
        $or: [
          ...(body.email ? [{ email: body.email }] : []),
          ...(body.licenseNumber ? [{ licenseNumber: body.licenseNumber }] : [])
        ]
      })
      
      if (existingDoctor) {
        return NextResponse.json(
          { error: 'Doctor with this email or license number already exists' },
          { status: 400 }
        )
      }
    }
    
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).select('-__v')
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      doctor: doctor
    })
  } catch (error) {
    console.error('Update doctor error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/doctors/[id] - Delete doctor
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    
    // Await the params object
    const { id } = await params
    
    const doctor = await Doctor.findByIdAndDelete(id)
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Doctor deleted successfully'
    })
  } catch (error) {
    console.error('Delete doctor error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}