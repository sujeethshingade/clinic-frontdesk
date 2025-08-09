import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Appointment from '@/lib/db/models/Appointment'

// GET /api/appointments/[id] - Get appointment by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const appointment = await Appointment.findById(params.id)
      .populate('patientId', 'name phone email')
      .populate('doctorId', 'name specialization')

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: appointment
    })
  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/appointments/[id] - Update appointment
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const body = await req.json()

    const appointment = await Appointment.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    )
      .populate('patientId', 'name phone email')
      .populate('doctorId', 'name specialization')

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: appointment
    })
  } catch (error) {
    console.error('Update appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/appointments/[id] - Delete appointment
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const appointment = await Appointment.findByIdAndDelete(params.id)

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully'
    })
  } catch (error) {
    console.error('Delete appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
