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
      Patient.countDocuments(),
      
      Doctor.countDocuments(),
      
      Queue.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      
      Appointment.countDocuments({
        appointmentDate: { $gte: today, $lt: tomorrow }
      }),
      
      Queue.countDocuments({
        status: { $in: ['waiting', 'in-progress'] },
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      
      Queue.countDocuments({
        status: 'completed',
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      
      Appointment.countDocuments({
        appointmentDate: { $gte: tomorrow, $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      }),
      
      Queue.countDocuments({
        status: 'waiting',
        createdAt: { $gte: today, $lt: tomorrow }
      })
    ])

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
          doctorName: { 
            $first: { 
              $concat: ['$doctorInfo.firstName', ' ', '$doctorInfo.lastName'] 
            } 
          },
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

    const weeklyTrend = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const date = new Date(last7Days)
        date.setDate(date.getDate() + i)
        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)

        const [appointmentCount, completedCount] = await Promise.all([
          Appointment.countDocuments({
            appointmentDate: { $gte: date, $lt: nextDay }
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

    const recentActivities = await Queue.find({
      createdAt: { $gte: today, $lt: tomorrow }
    })
      .populate('patientId', 'fullName')
      .populate('doctorId', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('patientId doctorId status queueNumber updatedAt reason')

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
