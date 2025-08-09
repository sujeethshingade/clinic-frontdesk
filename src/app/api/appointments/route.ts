import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Appointment from '@/lib/db/models/Appointment'
import Patient from '@/lib/db/models/Patient'
import Doctor from '@/lib/db/models/Doctor'

// GET /api/appointments - Get appointments
export async function GET(req: NextRequest) {
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

    const query: any = {}
    if (doctorId) query.doctorId = doctorId
    if (patientId) query.patientId = patientId
    if (status) query.status = status
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      query.appointmentDate = { $gte: startDate, $lt: endDate }
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('patientId')
        .populate('doctorId')
        .sort({ appointmentDate: 1, appointmentTime: 1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(query)
    ])

    const transformedAppointments = appointments.map((appointment: any) => ({
      _id: appointment._id,
      patient: {
        _id: appointment.patientId._id,
        name: appointment.patientId.fullName,
        phone: appointment.patientId.contactInfo.phone,
        email: appointment.patientId.contactInfo.email || ''
      },
      doctor: {
        _id: appointment.doctorId._id,
        firstName: appointment.doctorId.firstName,
        lastName: appointment.doctorId.lastName,
        specialization: appointment.doctorId.specialization
      },
      appointmentDate: appointment.appointmentDate.toISOString(),
      appointmentTime: appointment.appointmentTime,
      type: appointment.type,
      reason: appointment.reason,
      status: appointment.status,
      createdAt: appointment.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: transformedAppointments,
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

// POST /api/appointments - Create new appointment
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    if (!body.patientId || !body.doctorId || !body.appointmentDate || !body.appointmentTime) {
      return NextResponse.json(
        { error: 'Patient ID, Doctor ID, appointment date, and time are required' },
        { status: 400 }
      )
    }

    const patient = await Patient.findById(body.patientId)
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(body.doctorId)
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Create appointment
    const appointment = new Appointment({
      patientId: body.patientId,
      doctorId: body.doctorId,
      appointmentDate: new Date(body.appointmentDate),
      appointmentTime: body.appointmentTime,
      type: body.type || 'consultation',
      reason: body.reason || '',
      notes: body.notes || '',
      status: body.status || 'scheduled'
    })

    await appointment.save()
    await appointment.populate('patientId')
    await appointment.populate('doctorId')

    const transformedAppointment = {
      _id: appointment._id,
      patient: {
        _id: appointment.patientId._id,
        name: (appointment.patientId as any).fullName,
        phone: (appointment.patientId as any).contactInfo.phone,
        email: (appointment.patientId as any).contactInfo.email || ''
      },
      doctor: {
        _id: appointment.doctorId._id,
        firstName: (appointment.doctorId as any).firstName,
        lastName: (appointment.doctorId as any).lastName,
        specialization: (appointment.doctorId as any).specialization
      },
      appointmentDate: appointment.appointmentDate.toISOString(),
      appointmentTime: appointment.appointmentTime,
      type: appointment.type,
      reason: appointment.reason,
      status: appointment.status,
      createdAt: appointment.createdAt
    }

    return NextResponse.json({
      success: true,
      data: transformedAppointment
    }, { status: 201 })
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
