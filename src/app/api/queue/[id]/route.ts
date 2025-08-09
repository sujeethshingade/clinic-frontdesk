import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Queue from '@/lib/db/models/Queue'

// GET /api/queue/[id] - Get queue entry by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    // Await the params object
    const { id } = await params

    const queueEntry = await Queue.findById(id)
      .populate('patientId', 'name phone email')
      .populate('doctorId', 'name specialization')

    if (!queueEntry) {
      return NextResponse.json(
        { error: 'Queue entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: queueEntry
    })
  } catch (error) {
    console.error('Get queue entry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/queue/[id] - Update queue entry
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    // Await the params object
    const { id } = await params
    const body = await req.json()

    const queueEntry = await Queue.findById(id)
    if (!queueEntry) {
      return NextResponse.json(
        { error: 'Queue entry not found' },
        { status: 404 }
      )
    }

    // Special handling for status changes
    if (body.status) {
      if (body.status === 'in-progress') {
        body.calledAt = new Date()
      } else if (body.status === 'completed') {
        body.completedAt = new Date()
      }
    }

    // Update queue entry
    const updatedEntry = await Queue.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
      .populate('patientId', 'name phone email')
      .populate('doctorId', 'name specialization')

    return NextResponse.json({
      success: true,
      data: updatedEntry
    })
  } catch (error) {
    console.error('Update queue entry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/queue/[id] - Remove from queue
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    // Await the params object
    const { id } = await params

    const queueEntry = await Queue.findByIdAndDelete(id)

    if (!queueEntry) {
      return NextResponse.json(
        { error: 'Queue entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Queue entry deleted successfully'
    })
  } catch (error) {
    console.error('Delete queue entry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}