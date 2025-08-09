import { useState, useEffect } from 'react'
import { dashboardService } from '@/lib/api'

interface DashboardStats {
  overview: {
    totalPatients: number
    totalDoctors: number
    todayQueue: number
    todayAppointments: number
    activeQueue: number
    completedToday: number
    upcomingAppointments: number
    waitingPatients: number
  }
  queueByDoctor: Array<{
    _id: string
    doctorName: string
    waiting: number
    inProgress: number
    completed: number
    total: number
  }>
  weeklyTrend: Array<{
    day: string
    date: string
    appointments: number
    completed: number
  }>
  recentActivities: Array<{
    _id: string
    patientId: { name: string }
    doctorId: { name: string }
    status: string
    queueNumber: number
    updatedAt: string
  }>
}

export const useDashboardStats = () => {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const stats = await dashboardService.getStats()
        setData(stats)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { data, loading, error }
}
