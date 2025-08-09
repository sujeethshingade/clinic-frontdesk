'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QueueManagement } from '@/components/dashboard/QueueManagement'
import { AppointmentManagement } from '@/components/dashboard/AppointmentManagement'
import { DoctorManagement } from '@/components/dashboard/DoctorManagement'
import { Users, Calendar, UserPlus, Clock, AlertCircle } from 'lucide-react'
import { useDashboardStats } from '@/hooks/useApi'

export default function DashboardPage() {
  const { data: stats, loading, error } = useDashboardStats()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Manage your clinic operations</p>
      </div>

      {/* Quick Stats */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to load dashboard statistics</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waiting Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.overview.waitingPatients || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.overview.activeQueue || 0} active in queue
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.overview.todayAppointments || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.overview.upcomingAppointments || 0} upcoming this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.overview.totalDoctors || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.overview.totalPatients || 0} total patients
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.overview.completedToday || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.overview.todayQueue || 0} total queue entries
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="queue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue">Queue Management</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-6">
          <QueueManagement />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <AppointmentManagement />
        </TabsContent>

        <TabsContent value="doctors" className="space-y-6">
          <DoctorManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
