import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Patient from '@/lib/db/models/Patient'
import Doctor from '@/lib/db/models/Doctor'
import Queue from '@/lib/db/models/Queue'
import Appointment from '@/lib/db/models/Appointment'
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth'

// GET /api/dashboard/stats - Get dashboard statistics
export const GET = withRole(['admin', 'receptionist', 'doctor'])(
  async (req: AuthenticatedRequest) => {
    try {
      await connectDB()

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

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
        Patient.countDocuments({ status: 'active' }),
        
        // Total doctors
        Doctor.countDocuments({ status: 'active' }),
        
        // Today's total queue entries
        Queue.countDocuments({
          createdAt: { $gte: today, $lt: tomorrow }
        }),
        
        // Today's appointments
        Appointment.countDocuments({
          appointmentDate: { $gte: today, $lt: tomorrow },
          status: { $in: ['scheduled', 'confirmed', 'completed'] }
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
          appointmentDate: { $gte: tomorrow, $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
          status: { $in: ['scheduled', 'confirmed'] }
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
            localField: 'doctor',
            foreignField: '_id',
            as: 'doctorInfo'
          }
        },
        {
          $unwind: '$doctorInfo'
        },
        {
          $group: {
            _id: '$doctor',
            doctorName: { $first: { $concat: ['$doctorInfo.firstName', ' ', '$doctorInfo.lastName'] } },
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

      // Recent activities (last 10 queue updates)
      const recentActivities = await Queue.find({
        createdAt: { $gte: today, $lt: tomorrow }
      })
        .populate('patient', 'firstName lastName patientId')
        .populate('doctor', 'firstName lastName')
        .sort({ updatedAt: -1 })
        .limit(10)
        .select('patient doctor status queueNumber updatedAt')

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
)
