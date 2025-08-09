import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Appointment from '@/lib/db/models/Appointment'
import Patient from '@/lib/db/models/Patient'
import Doctor from '@/lib/db/models/Doctor'
import { CreateAppointmentDto } from '@/lib/dto/appointment.dto'
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth'
import { ValidationUtils } from '@/lib/validation'

// GET /api/appointments - Get appointments
export const GET = withRole(['admin', 'receptionist', 'doctor', 'patient'])(
  async (req: AuthenticatedRequest) => {
    try {
      await connectDB()

      const { searchParams } = new URL(req.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')
      const doctorId = searchParams.get('doctorId')
      const patientId = searchParams.get('patientId')
      const status = searchParams.get('status')
      const date = searchParams.get('date')

      const skip = (page - 1) * limit

      // Build query
      const query: any = {}
      if (doctorId) query.doctor = doctorId
      if (patientId) query.patient = patientId
      if (status) query.status = status
      if (date) {
        const startDate = new Date(date)
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 1)
        query.appointmentDate = { $gte: startDate, $lt: endDate }
      }

      // Patients can only see their own appointments
      if (req.user!.role === 'patient') {
        const patientRecord = await Patient.findOne({ user: req.user!.userId })
        if (patientRecord) {
          query.patient = patientRecord._id
        } else {
          return NextResponse.json({ appointments: [], pagination: { page, limit, total: 0, pages: 0 } })
        }
      }

      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate('patient', 'firstName lastName patientId phone email')
          .populate('doctor', 'firstName lastName specialization')
          .sort({ appointmentDate: 1, appointmentTime: 1 })
          .skip(skip)
          .limit(limit),
        Appointment.countDocuments(query)
      ])

      return NextResponse.json({
        appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error('Get appointments error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)

// POST /api/appointments - Create new appointment
export const POST = withRole(['admin', 'receptionist', 'patient'])(
  async (req: AuthenticatedRequest) => {
    try {
      await connectDB()

      const body = await req.json()
      const validationResult = await ValidationUtils.validateDto(CreateAppointmentDto, body)

      if (!validationResult.isValid) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationResult.errors },
          { status: 400 }
        )
      }

      const appointmentData = body

      // If patient is making the appointment, restrict to their own record
      if (req.user!.role === 'patient') {
        const patientRecord = await Patient.findOne({ user: req.user!.userId })
        if (!patientRecord || patientRecord._id.toString() !== appointmentData.patientId) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          )
        }
      }

      // Verify patient exists
      const patient = await Patient.findById(appointmentData.patientId)
      if (!patient) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        )
      }

      // Verify doctor exists
      const doctor = await Doctor.findById(appointmentData.doctorId)
      if (!doctor) {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        )
      }

      // Check for appointment conflicts
      const appointmentDateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.appointmentTime}`)
      const conflictStart = new Date(appointmentDateTime.getTime() - 30 * 60000) // 30 minutes before
      const conflictEnd = new Date(appointmentDateTime.getTime() + 30 * 60000) // 30 minutes after

      const conflictingAppointment = await Appointment.findOne({
        doctor: appointmentData.doctorId,
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

      // Create appointment
      const appointment = new Appointment({
        patient: appointmentData.patientId,
        doctor: appointmentData.doctorId,
        appointmentDate: new Date(appointmentData.appointmentDate),
        appointmentTime: appointmentData.appointmentTime,
        type: appointmentData.type,
        reason: appointmentData.reason,
        notes: appointmentData.notes,
        status: 'scheduled'
      })

      await appointment.save()
      await appointment.populate([
        { path: 'patient', select: 'firstName lastName patientId phone email' },
        { path: 'doctor', select: 'firstName lastName specialization' }
      ])

      return NextResponse.json({
        message: 'Appointment created successfully',
        appointment
      }, { status: 201 })
    } catch (error) {
      console.error('Create appointment error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)
