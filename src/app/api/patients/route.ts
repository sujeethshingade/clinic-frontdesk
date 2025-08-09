import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Patient from '@/lib/db/models/Patient'

// GET /api/patients - Get all patients
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ]
    }

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Patient.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get patients error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/patients - Create new patient
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    // Basic validation
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingPatient = await Patient.findOne({ email: body.email })
    if (existingPatient) {
      return NextResponse.json(
        { error: 'Patient with this email already exists' },
        { status: 400 }
      )
    }

    // Generate patient ID
    const patientCount = await Patient.countDocuments()
    const patientId = `P${String(patientCount + 1).padStart(6, '0')}`

    // Create patient
    const patient = new Patient({
      patientId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address || '',
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      gender: body.gender || '',
      emergencyContact: body.emergencyContact || '',
      medicalHistory: body.medicalHistory || ''
    })

    await patient.save()

    return NextResponse.json({
      success: true,
      data: patient
    }, { status: 201 })
  } catch (error) {
    console.error('Create patient error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
