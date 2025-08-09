import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Queue from '@/lib/db/models/Queue'
import Patient from '@/lib/db/models/Patient'
import Doctor from '@/lib/db/models/Doctor'

// GET /api/queue - Get queue entries
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const doctorId = searchParams.get('doctorId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    // Build query
    const query: any = {}
    if (doctorId) query.doctorId = doctorId
    if (status) query.status = status
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      query.createdAt = { $gte: startDate, $lt: endDate }
    }

    const queueEntries = await Queue.find(query)
      .populate('patientId', 'name patientId')
      .populate('doctorId', 'name specialization')
      .sort({ priority: -1, queueNumber: 1 })

    return NextResponse.json({
      success: true,
      data: queueEntries
    })
  } catch (error) {
    console.error('Get queue error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/queue - Add patient to queue
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    // Basic validation
    if (!body.patientId || !body.doctorId) {
      return NextResponse.json(
        { error: 'Patient ID and Doctor ID are required' },
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

    // Check if patient is already in queue for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingEntry = await Queue.findOne({
      patientId: body.patientId,
      doctorId: body.doctorId,
      status: { $in: ['waiting', 'in-progress'] },
      createdAt: { $gte: today, $lt: tomorrow }
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Patient is already in queue for this doctor today' },
        { status: 400 }
      )
    }

    // Get next queue number for this doctor today
    const lastEntry = await Queue.findOne({
      doctorId: body.doctorId,
      createdAt: { $gte: today, $lt: tomorrow }
    }).sort({ queueNumber: -1 })

    const queueNumber = lastEntry ? lastEntry.queueNumber + 1 : 1

    // Create queue entry
    const queueEntry = new Queue({
      patientId: body.patientId,
      doctorId: body.doctorId,
      queueNumber,
      priority: body.priority || 'normal',
      reason: body.reason || '',
      notes: body.notes || '',
      status: 'waiting'
    })

    await queueEntry.save()
    await queueEntry.populate([
      { path: 'patientId', select: 'name patientId' },
      { path: 'doctorId', select: 'name specialization' }
    ])

    return NextResponse.json({
      success: true,
      data: queueEntry
    }, { status: 201 })
  } catch (error) {
    console.error('Add to queue error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
