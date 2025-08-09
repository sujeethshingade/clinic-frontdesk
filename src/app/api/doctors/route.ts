import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Doctor from '@/lib/db/models/Doctor'
import { ValidationUtils } from '@/lib/validation'
import { CreateDoctorDto } from '@/lib/dto/doctor.dto'
import { withAuth } from '@/lib/middleware/auth'

// GET /api/doctors - Get all doctors with optional filtering
export const GET = withAuth(async (request: NextRequest) => {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const specialization = searchParams.get('specialization')
    const location = searchParams.get('location')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Build filter query
    const filter: any = {}
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' }
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' }
    }
    
    const skip = (page - 1) * limit
    
    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .select('-__v')
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 }),
      Doctor.countDocuments(filter)
    ])
    
    return NextResponse.json({
      success: true,
      data: doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get doctors error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/doctors - Create new doctor
export const POST = withAuth(async (request: NextRequest) => {
  try {
    await connectDB()
    
    const body = await request.json()
    
    // Validate input
    const validation = await ValidationUtils.validateDto(CreateDoctorDto, body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }
    
    const doctor = new Doctor(body)
    await doctor.save()
    
    return NextResponse.json({
      success: true,
      data: doctor
    }, { status: 201 })
  } catch (error) {
    console.error('Create doctor error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
