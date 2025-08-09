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
      .populate('patientId')
      .populate('doctorId')
      .sort({ priority: -1, queueNumber: 1 })

    // Transform data to match frontend expectations
    const transformedQueue = queueEntries.map((entry: any) => ({
      _id: entry._id,
      queueNumber: entry.queueNumber,
      patient: {
        _id: entry.patientId._id,
        name: entry.patientId.fullName,
        phone: entry.patientId.contactInfo.phone
      },
      doctor: {
        _id: entry.doctorId._id,
        firstName: entry.doctorId.firstName,
        lastName: entry.doctorId.lastName,
        specialization: entry.doctorId.specialization
      },
      priority: entry.priority,
      status: entry.status,
      reason: entry.reason,
      notes: entry.notes,
      createdAt: entry.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: transformedQueue
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
    
    // Populate the saved entry
    await queueEntry.populate('patientId')
    await queueEntry.populate('doctorId')

    // Transform response to match frontend expectations
    const transformedEntry = {
      _id: queueEntry._id,
      queueNumber: queueEntry.queueNumber,
      patient: {
        _id: queueEntry.patientId._id,
        name: (queueEntry.patientId as any).fullName,
        phone: (queueEntry.patientId as any).contactInfo.phone
      },
      doctor: {
        _id: queueEntry.doctorId._id,
        firstName: (queueEntry.doctorId as any).firstName,
        lastName: (queueEntry.doctorId as any).lastName,
        specialization: (queueEntry.doctorId as any).specialization
      },
      priority: queueEntry.priority,
      status: queueEntry.status,
      reason: queueEntry.reason,
      notes: queueEntry.notes,
      createdAt: queueEntry.createdAt
    }

    return NextResponse.json({
      success: true,
      data: transformedEntry
    }, { status: 201 })
  } catch (error) {
    console.error('Add to queue error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
