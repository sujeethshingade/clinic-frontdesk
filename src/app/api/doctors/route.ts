import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Doctor from '@/lib/db/models/Doctor'

// GET /api/doctors - Get all doctors with optional filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const specialization = searchParams.get('specialization')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const filter: any = {}
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' }
    }
    
    const skip = (page - 1) * limit
    
    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .select('-__v')
        .skip(skip)
        .limit(limit)
        .sort({ firstName: 1, lastName: 1 }),
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
}

// POST /api/doctors - Create new doctor
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    if (!body.firstName || !body.lastName || !body.specialization || !body.email || !body.licenseNumber || !body.phone) {
      return NextResponse.json(
        { error: 'First name, last name, specialization, email, license number, and phone are required' },
        { status: 400 }
      )
    }
    
    const existingDoctor = await Doctor.findOne({
      $or: [
        { email: body.email },
        { licenseNumber: body.licenseNumber }
      ]
    })
    
    if (existingDoctor) {
      return NextResponse.json(
        { error: 'Doctor with this email or license number already exists' },
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
}
