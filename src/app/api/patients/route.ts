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
        { fullName: { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } },
        { 'contactInfo.phone': { $regex: search, $options: 'i' } }
      ]
    }

    const [patientsData, total] = await Promise.all([
      Patient.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Patient.countDocuments(query)
    ])

    // Transform data to match frontend expectations
    const patients = patientsData.map((patient, index) => ({
      _id: patient._id,
      patientId: `P${String(index + 1).padStart(6, '0')}`, // Generate display ID
      name: patient.fullName,
      email: patient.contactInfo.email || '',
      phone: patient.contactInfo.phone,
      address: patient.contactInfo.address || '',
      dateOfBirth: patient.dateOfBirth?.toISOString() || '',
      gender: patient.gender || '',
      emergencyContact: patient.contactInfo.emergencyContact?.name || '',
      medicalHistory: patient.medicalNotes || '',
      createdAt: patient.createdAt.toISOString()
    }))

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
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    // Check if email already exists (if email is provided)
    if (body.email) {
      const existingPatient = await Patient.findOne({ 'contactInfo.email': body.email })
      if (existingPatient) {
        return NextResponse.json(
          { error: 'Patient with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Create patient with correct schema structure
    const patient = new Patient({
      fullName: body.name,
      contactInfo: {
        phone: body.phone,
        email: body.email || undefined,
        address: body.address || undefined,
        emergencyContact: body.emergencyContact ? {
          name: body.emergencyContact,
          phone: body.emergencyContact,
          relationship: 'Emergency Contact'
        } : undefined
      },
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      gender: body.gender || undefined,
      medicalNotes: body.medicalHistory || undefined
    })

    await patient.save()

    // Transform response to match frontend expectations
    const transformedPatient = {
      _id: patient._id,
      patientId: `P${String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0')}`,
      name: patient.fullName,
      email: patient.contactInfo.email || '',
      phone: patient.contactInfo.phone,
      address: patient.contactInfo.address || '',
      dateOfBirth: patient.dateOfBirth?.toISOString() || '',
      gender: patient.gender || '',
      emergencyContact: patient.contactInfo.emergencyContact?.name || '',
      medicalHistory: patient.medicalNotes || '',
      createdAt: patient.createdAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: transformedPatient
    }, { status: 201 })
  } catch (error) {
    console.error('Create patient error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
