import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Queue from '@/lib/db/models/Queue'
import { UpdateQueueDto } from '@/lib/dto/queue.dto'
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth'
import { ValidationUtils } from '@/lib/validation'

// GET /api/queue/[id] - Get queue entry by ID
export const GET = withRole(['admin', 'receptionist', 'doctor'])(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      await connectDB()

      const queueEntry = await Queue.findById(params.id)
        .populate('patient', 'firstName lastName patientId phone email')
        .populate('doctor', 'firstName lastName specialization')

      if (!queueEntry) {
        return NextResponse.json(
          { error: 'Queue entry not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ queueEntry })
    } catch (error) {
      console.error('Get queue entry error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)

// PUT /api/queue/[id] - Update queue entry
export const PUT = withRole(['admin', 'receptionist', 'doctor'])(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      await connectDB()

      const body = await req.json()
      const validationResult = await ValidationUtils.validateDto(UpdateQueueDto, body)

      if (!validationResult.isValid) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationResult.errors },
          { status: 400 }
        )
      }

      const updateData = body

      const queueEntry = await Queue.findById(params.id)
      if (!queueEntry) {
        return NextResponse.json(
          { error: 'Queue entry not found' },
          { status: 404 }
        )
      }

      // Special handling for status changes
      if (updateData.status) {
        if (updateData.status === 'in-progress') {
          updateData.calledAt = new Date()
        } else if (updateData.status === 'completed') {
          updateData.completedAt = new Date()
        }
      }

      // Update queue entry
      Object.assign(queueEntry, updateData)
      queueEntry.updatedAt = new Date()
      await queueEntry.save()

      await queueEntry.populate([
        { path: 'patient', select: 'firstName lastName patientId phone email' },
        { path: 'doctor', select: 'firstName lastName specialization' }
      ])

      return NextResponse.json({
        message: 'Queue entry updated successfully',
        queueEntry
      })
    } catch (error) {
      console.error('Update queue entry error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)

// DELETE /api/queue/[id] - Remove from queue
export const DELETE = withRole(['admin', 'receptionist'])(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      await connectDB()

      const queueEntry = await Queue.findById(params.id)
      if (!queueEntry) {
        return NextResponse.json(
          { error: 'Queue entry not found' },
          { status: 404 }
        )
      }

      // Mark as cancelled instead of deleting
      queueEntry.status = 'cancelled'
      queueEntry.updatedAt = new Date()
      await queueEntry.save()

      return NextResponse.json({
        message: 'Queue entry cancelled successfully'
      })
    } catch (error) {
      console.error('Cancel queue entry error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)
