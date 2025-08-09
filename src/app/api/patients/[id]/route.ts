import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Patient from '@/lib/db/models/Patient'

// GET /api/patients/[id] - Get patient by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    
    const { id } = await params
    
    const patient = await Patient.findById(id).select('-__v')
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }
    
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
    
    // Transform the update data to match the schema
    const updateData: any = {}
    
    if (body.name) updateData.fullName = body.name
    if (body.dateOfBirth) updateData.dateOfBirth = new Date(body.dateOfBirth)
    if (body.gender) updateData.gender = body.gender
    if (body.medicalHistory) updateData.medicalNotes = body.medicalHistory
    
    // Handle contactInfo updates
    const contactInfoUpdates: any = {}
    if (body.phone) contactInfoUpdates.phone = body.phone
    if (body.email !== undefined) contactInfoUpdates.email = body.email
    if (body.address !== undefined) contactInfoUpdates.address = body.address
    if (body.emergencyContact) {
      contactInfoUpdates.emergencyContact = {
        name: body.emergencyContact,
        phone: body.emergencyContact,
        relationship: 'Emergency Contact'
      }
    }
    
    Object.keys(contactInfoUpdates).forEach(key => {
      updateData[`contactInfo.${key}`] = contactInfoUpdates[key]
    })
    
    const patient = await Patient.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v')
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }
    
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