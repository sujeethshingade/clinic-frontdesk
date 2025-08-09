import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Patient from '@/lib/db/models/Patient'
import User from '@/lib/db/models/User'
import { CreatePatientDto } from '@/lib/dto/patient.dto'
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth'
import { ValidationUtils } from '@/lib/validation'

// GET /api/patients - Get all patients
export const GET = withRole(['admin', 'receptionist', 'doctor'])(
  async (req: AuthenticatedRequest) => {
    try {
      await connectDB()

      const { searchParams } = new URL(req.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const search = searchParams.get('search') || ''
      const status = searchParams.get('status')

      const skip = (page - 1) * limit

      // Build query
      const query: any = {}
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { patientId: { $regex: search, $options: 'i' } }
        ]
      }
      if (status) {
        query.status = status
      }

      const [patients, total] = await Promise.all([
        Patient.find(query)
          .populate('user', 'email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Patient.countDocuments(query)
      ])

      return NextResponse.json({
        patients,
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
)

// POST /api/patients - Create new patient
export const POST = withRole(['admin', 'receptionist'])(
  async (req: AuthenticatedRequest) => {
    try {
      await connectDB()

      const body = await req.json()
      const validationResult = await ValidationUtils.validateDto(CreatePatientDto, body)

      if (!validationResult.isValid) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationResult.errors },
          { status: 400 }
        )
      }

      const patientData = body

      // Check if email already exists
      const existingUser = await User.findOne({ email: patientData.email })
      if (existingUser) {
        // Check if this user is already a patient
        const existingPatient = await Patient.findOne({ user: existingUser._id })
        if (existingPatient) {
          return NextResponse.json(
            { error: 'Patient with this email already exists' },
            { status: 400 }
          )
        }
      }

      // Create user account if doesn't exist
      let user = existingUser
      if (!user) {
        user = new User({
          email: patientData.email,
          password: 'temp123', // Temporary password - should be changed on first login
          role: 'patient'
        })
        await user.save()
      } else if (user.role !== 'patient') {
        return NextResponse.json(
          { error: 'User with this email exists with different role' },
          { status: 400 }
        )
      }

      // Generate patient ID
      const patientCount = await Patient.countDocuments()
      const patientId = `P${String(patientCount + 1).padStart(6, '0')}`

      // Create patient
      const patient = new Patient({
        user: user._id,
        patientId,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        dateOfBirth: new Date(patientData.dateOfBirth),
        gender: patientData.gender,
        phone: patientData.phone,
        email: patientData.email,
        address: patientData.address,
        emergencyContact: patientData.emergencyContact,
        medicalHistory: patientData.medicalHistory || [],
        allergies: patientData.allergies || [],
        medications: patientData.medications || [],
        status: 'active'
      })

      await patient.save()
      await patient.populate('user', 'email')

      return NextResponse.json(
        { message: 'Patient created successfully', patient },
        { status: 201 }
      )
    } catch (error) {
      console.error('Create patient error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)
