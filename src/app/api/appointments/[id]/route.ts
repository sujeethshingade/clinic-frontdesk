import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Appointment from '@/lib/db/models/Appointment'
import Patient from '@/lib/db/models/Patient'
import { UpdateAppointmentDto } from '@/lib/dto/appointment.dto'
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth'
import { ValidationUtils } from '@/lib/validation'

// GET /api/appointments/[id] - Get appointment by ID
export const GET = withRole(['admin', 'receptionist', 'doctor', 'patient'])(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      await connectDB()

      const appointment = await Appointment.findById(params.id)
        .populate('patient', 'firstName lastName patientId phone email')
        .populate('doctor', 'firstName lastName specialization')

      if (!appointment) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        )
      }

      // Patients can only view their own appointments
      if (req.user!.role === 'patient') {
        const patientRecord = await Patient.findOne({ user: req.user!.userId })
        if (!patientRecord || appointment.patient._id.toString() !== patientRecord._id.toString()) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          )
        }
      }

      return NextResponse.json({ appointment })
    } catch (error) {
      console.error('Get appointment error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)

// PUT /api/appointments/[id] - Update appointment
export const PUT = withRole(['admin', 'receptionist', 'doctor'])(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      await connectDB()

      const body = await req.json()
      const validationResult = await ValidationUtils.validateDto(UpdateAppointmentDto, body)

      if (!validationResult.isValid) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationResult.errors },
          { status: 400 }
        )
      }

      const updateData = body

      const appointment = await Appointment.findById(params.id)
      if (!appointment) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        )
      }

      // If updating time/date, check for conflicts
      if (updateData.appointmentDate || updateData.appointmentTime) {
        const newDate = updateData.appointmentDate ? new Date(updateData.appointmentDate) : appointment.appointmentDate
        const newTime = updateData.appointmentTime || appointment.appointmentTime
        
        const appointmentDateTime = new Date(`${newDate.toISOString().split('T')[0]}T${newTime}`)
        const conflictStart = new Date(appointmentDateTime.getTime() - 30 * 60000)
        const conflictEnd = new Date(appointmentDateTime.getTime() + 30 * 60000)

        const conflictingAppointment = await Appointment.findOne({
          _id: { $ne: params.id },
          doctor: appointment.doctor,
          status: { $in: ['scheduled', 'confirmed'] },
          $expr: {
            $and: [
              {
                $lt: [
                  { $dateFromString: { dateString: { $concat: [{ $dateToString: { date: '$appointmentDate', format: '%Y-%m-%d' } }, 'T', '$appointmentTime'] } } },
                  conflictEnd
                ]
              },
              {
                $gt: [
                  { $dateFromString: { dateString: { $concat: [{ $dateToString: { date: '$appointmentDate', format: '%Y-%m-%d' } }, 'T', '$appointmentTime'] } } },
                  conflictStart
                ]
              }
            ]
          }
        })

        if (conflictingAppointment) {
          return NextResponse.json(
            { error: 'Doctor has a conflicting appointment at this time' },
            { status: 400 }
          )
        }
      }

      // Update appointment
      Object.assign(appointment, updateData)
      if (updateData.appointmentDate) {
        appointment.appointmentDate = new Date(updateData.appointmentDate)
      }
      appointment.updatedAt = new Date()
      await appointment.save()

      await appointment.populate([
        { path: 'patient', select: 'firstName lastName patientId phone email' },
        { path: 'doctor', select: 'firstName lastName specialization' }
      ])

      return NextResponse.json({
        message: 'Appointment updated successfully',
        appointment
      })
    } catch (error) {
      console.error('Update appointment error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)

// DELETE /api/appointments/[id] - Cancel appointment
export const DELETE = withRole(['admin', 'receptionist', 'patient'])(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      await connectDB()

      const appointment = await Appointment.findById(params.id)
      if (!appointment) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        )
      }

      // Patients can only cancel their own appointments
      if (req.user!.role === 'patient') {
        const patientRecord = await Patient.findOne({ user: req.user!.userId })
        if (!patientRecord || appointment.patient.toString() !== patientRecord._id.toString()) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          )
        }
      }

      // Mark as cancelled instead of deleting
      appointment.status = 'cancelled'
      appointment.updatedAt = new Date()
      await appointment.save()

      return NextResponse.json({
        message: 'Appointment cancelled successfully'
      })
    } catch (error) {
      console.error('Cancel appointment error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)
