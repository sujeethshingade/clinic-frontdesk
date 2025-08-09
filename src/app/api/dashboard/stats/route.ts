import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Patient from '@/lib/db/models/Patient'
import Doctor from '@/lib/db/models/Doctor'
import Queue from '@/lib/db/models/Queue'
import Appointment from '@/lib/db/models/Appointment'

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get last 7 days for trend data
    const last7Days = new Date(today)
    last7Days.setDate(last7Days.getDate() - 6)

    const [
      totalPatients,
      totalDoctors,
      todayQueue,
      todayAppointments,
      activeQueue,
      completedToday,
      upcomingAppointments,
      waitingPatients
    ] = await Promise.all([
      // Total patients
      Patient.countDocuments(),
      
      // Total doctors
      Doctor.countDocuments(),
      
      // Today's total queue entries
      Queue.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      
      // Today's appointments
      Appointment.countDocuments({
        appointmentDateTime: { $gte: today, $lt: tomorrow }
      }),
      
      // Active queue (waiting + in-progress)
      Queue.countDocuments({
        status: { $in: ['waiting', 'in-progress'] },
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      
      // Completed today
      Queue.countDocuments({
        status: 'completed',
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      
      // Upcoming appointments (next 7 days)
      Appointment.countDocuments({
        appointmentDateTime: { $gte: tomorrow, $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      }),
      
      // Current waiting patients
      Queue.countDocuments({
        status: 'waiting',
        createdAt: { $gte: today, $lt: tomorrow }
      })
    ])

    // Get queue by doctor for today
    const queueByDoctor = await Queue.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      {
        $unwind: '$doctorInfo'
      },
      {
        $group: {
          _id: '$doctorId',
          doctorName: { $first: '$doctorInfo.name' },
          waiting: {
            $sum: {
              $cond: [{ $eq: ['$status', 'waiting'] }, 1, 0]
            }
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0]
            }
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          total: { $sum: 1 }
        }
      },
      {
        $sort: { doctorName: 1 }
      }
    ])

    // Get weekly trend data (last 7 days)
    const weeklyTrend = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const date = new Date(last7Days)
        date.setDate(date.getDate() + i)
        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)

        const [appointmentCount, completedCount] = await Promise.all([
          Appointment.countDocuments({
            appointmentDateTime: { $gte: date, $lt: nextDay }
          }),
          Queue.countDocuments({
            status: 'completed',
            createdAt: { $gte: date, $lt: nextDay }
          })
        ])

        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toISOString().split('T')[0],
          appointments: appointmentCount,
          completed: completedCount
        }
      })
    )

    // Recent activities (last 10 queue updates)
    const recentActivities = await Queue.find({
      createdAt: { $gte: today, $lt: tomorrow }
    })
      .populate('patientId', 'name')
      .populate('doctorId', 'name')
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('patientId doctorId status queueNumber updatedAt')

    return NextResponse.json({
      overview: {
        totalPatients,
        totalDoctors,
        todayQueue,
        todayAppointments,
        activeQueue,
        completedToday,
        upcomingAppointments,
        waitingPatients
      },
      queueByDoctor,
      weeklyTrend,
      recentActivities
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
