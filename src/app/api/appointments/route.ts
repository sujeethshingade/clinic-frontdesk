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

    // Build query
    const query: any = {}
    if (doctorId) query.doctorId = doctorId
    if (patientId) query.patientId = patientId
    if (status) query.status = status
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      query.appointmentDateTime = { $gte: startDate, $lt: endDate }
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('patientId', 'name phone email')
        .populate('doctorId', 'name specialization')
        .sort({ appointmentDateTime: 1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: appointments,
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

    // Basic validation
    if (!body.patientId || !body.doctorId || !body.appointmentDateTime) {
      return NextResponse.json(
        { error: 'Patient ID, Doctor ID, and appointment date/time are required' },
        { status: 400 }
      )
    }

    // Verify patient exists
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
      appointmentDateTime: new Date(body.appointmentDateTime),
      type: body.type || 'consultation',
      reason: body.reason || '',
      notes: body.notes || '',
      status: body.status || 'scheduled'
    })

    await appointment.save()
    await appointment.populate([
      { path: 'patientId', select: 'name phone email' },
      { path: 'doctorId', select: 'name specialization' }
    ])

    return NextResponse.json({
      success: true,
      data: appointment
    }, { status: 201 })
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
