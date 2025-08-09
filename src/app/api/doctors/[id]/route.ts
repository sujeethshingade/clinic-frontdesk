import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Doctor from '@/lib/db/models/Doctor'
import { ValidationUtils } from '@/lib/validation'
import { UpdateDoctorDto } from '@/lib/dto/doctor.dto'
import { withAuth } from '@/lib/middleware/auth'

// GET /api/doctors/[id] - Get doctor by ID
export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB()
    
    const doctor = await Doctor.findById(params.id).select('-__v')
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: doctor
    })
  } catch (error) {
    console.error('Get doctor error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// PUT /api/doctors/[id] - Update doctor
export const PUT = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB()
    
    const body = await request.json()
    
    // Validate input
    const validation = await ValidationUtils.validateDto(UpdateDoctorDto, body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }
    
    const doctor = await Doctor.findByIdAndUpdate(
      params.id,
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
      data: doctor
    })
  } catch (error) {
    console.error('Update doctor error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// DELETE /api/doctors/[id] - Delete doctor
export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB()
    
    const doctor = await Doctor.findByIdAndDelete(params.id)
    
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
})
