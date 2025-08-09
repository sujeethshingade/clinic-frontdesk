import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Queue from '@/lib/db/models/Queue'
import Patient from '@/lib/db/models/Patient'
import Doctor from '@/lib/db/models/Doctor'
import { CreateQueueDto } from '@/lib/dto/queue.dto'
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth'
import { ValidationUtils } from '@/lib/validation'

// GET /api/queue - Get queue entries
export const GET = withRole(['admin', 'receptionist', 'doctor'])(
  async (req: AuthenticatedRequest) => {
    try {
      await connectDB()

      const { searchParams } = new URL(req.url)
      const doctorId = searchParams.get('doctorId')
      const status = searchParams.get('status')
      const date = searchParams.get('date')

      // Build query
      const query: any = {}
      if (doctorId) query.doctor = doctorId
      if (status) query.status = status
      if (date) {
        const startDate = new Date(date)
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 1)
        query.createdAt = { $gte: startDate, $lt: endDate }
      }

      const queueEntries = await Queue.find(query)
        .populate('patient', 'firstName lastName patientId')
        .populate('doctor', 'firstName lastName specialization')
        .sort({ priority: -1, queueNumber: 1 })

      return NextResponse.json({ queue: queueEntries })
    } catch (error) {
      console.error('Get queue error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)

// POST /api/queue - Add patient to queue
export const POST = withRole(['admin', 'receptionist'])(
  async (req: AuthenticatedRequest) => {
    try {
      await connectDB()

      const body = await req.json()
      const validationResult = await ValidationUtils.validateDto(CreateQueueDto, body)

      if (!validationResult.isValid) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationResult.errors },
          { status: 400 }
        )
      }

      const queueData = body

      // Verify patient exists
      const patient = await Patient.findById(queueData.patientId)
      if (!patient) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        )
      }

      // Verify doctor exists
      const doctor = await Doctor.findById(queueData.doctorId)
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
        patient: queueData.patientId,
        doctor: queueData.doctorId,
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
        doctor: queueData.doctorId,
        createdAt: { $gte: today, $lt: tomorrow }
      }).sort({ queueNumber: -1 })

      const queueNumber = lastEntry ? lastEntry.queueNumber + 1 : 1

      // Create queue entry
      const queueEntry = new Queue({
        patient: queueData.patientId,
        doctor: queueData.doctorId,
        queueNumber,
        priority: queueData.priority || 'normal',
        reason: queueData.reason,
        notes: queueData.notes,
        status: 'waiting'
      })

      await queueEntry.save()
      await queueEntry.populate([
        { path: 'patient', select: 'firstName lastName patientId' },
        { path: 'doctor', select: 'firstName lastName specialization' }
      ])

      return NextResponse.json({
        message: 'Patient added to queue successfully',
        queueEntry
      }, { status: 201 })
    } catch (error) {
      console.error('Add to queue error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)
