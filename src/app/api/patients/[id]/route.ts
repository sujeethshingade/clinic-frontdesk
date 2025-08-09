import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Patient from '@/lib/db/models/Patient'
import { UpdatePatientDto } from '@/lib/dto/patient.dto'
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth'
import { ValidationUtils } from '@/lib/validation'

// GET /api/patients/[id] - Get patient by ID
export const GET = withRole(['admin', 'receptionist', 'doctor', 'patient'])(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      await connectDB()

      const patient = await Patient.findById(params.id).populate('user', 'email')
      if (!patient) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        )
      }

      // Patients can only view their own records
      if (req.user!.role === 'patient') {
        const patientRecord = await Patient.findOne({ user: req.user!.userId })
        if (!patientRecord || patientRecord._id.toString() !== params.id) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          )
        }
      }

      return NextResponse.json({ patient })
    } catch (error) {
      console.error('Get patient error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)

// PUT /api/patients/[id] - Update patient
export const PUT = withRole(['admin', 'receptionist'])(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      await connectDB()

      const body = await req.json()
      const validationResult = await ValidationUtils.validateDto(UpdatePatientDto, body)

      if (!validationResult.isValid) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationResult.errors },
          { status: 400 }
        )
      }

      // Use the original body data since validation passed
      const updateData = body

      const patient = await Patient.findById(params.id)
      if (!patient) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        )
      }

      // Check if email is being changed and if it conflicts
      if (updateData.email && updateData.email !== patient.email) {
        const existingPatient = await Patient.findOne({ 
          email: updateData.email,
          _id: { $ne: params.id }
        })
        if (existingPatient) {
          return NextResponse.json(
            { error: 'Patient with this email already exists' },
            { status: 400 }
          )
        }
      }

      // Update patient
      Object.assign(patient, updateData)
      patient.updatedAt = new Date()
      await patient.save()

      await patient.populate('user', 'email')

      return NextResponse.json({
        message: 'Patient updated successfully',
        patient
      })
    } catch (error) {
      console.error('Update patient error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)

// DELETE /api/patients/[id] - Delete patient
export const DELETE = withRole(['admin'])(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      await connectDB()

      const patient = await Patient.findById(params.id)
      if (!patient) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        )
      }

      // Soft delete - change status to inactive
      patient.status = 'inactive'
      patient.updatedAt = new Date()
      await patient.save()

      return NextResponse.json({
        message: 'Patient deactivated successfully'
      })
    } catch (error) {
      console.error('Delete patient error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)
