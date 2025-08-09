'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardStats } from '@/hooks/useDashboard'
import { Users, Calendar, UserPlus, Clock, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function DashboardPage() {
  const { data: stats, loading, error } = useDashboardStats()

  // Prepare chart data from real API data
  const queueByDoctorData = stats?.queueByDoctor?.map(item => ({
    name: item.doctorName,
    total: item.total,
    waiting: item.waiting,
    inProgress: item.inProgress,
    completed: item.completed
  })) || []

  // Use real weekly trend data from API
  const weeklyTrendData = stats?.weeklyTrend || []

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Manage your clinic operations</p>
      </div>

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
              <span>Failed to load dashboard statistics: {error}</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Waiting Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.waitingPatients || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.todayAppointments || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.totalDoctors || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.completedToday || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Queue by Doctor Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Queue by Doctor (Today)</CardTitle>
              </CardHeader>
              <CardContent>
                {queueByDoctorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={queueByDoctorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="waiting" stackId="a" fill="#FF8042" name="Waiting" />
                      <Bar dataKey="inProgress" stackId="a" fill="#FFBB28" name="In Progress" />
                      <Bar dataKey="completed" stackId="a" fill="#00C49F" name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No queue data available for today
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Trend Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Appointments Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="appointments" stroke="#8884d8" strokeWidth={2} name="Scheduled" />
                      <Line type="monotone" dataKey="completed" stroke="#82ca9d" strokeWidth={2} name="Completed" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No weekly trend data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution and Recent Activities */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Patient Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Waiting', value: stats?.overview.waitingPatients || 0, fill: '#FF8042' },
                        { name: 'Active Queue', value: stats?.overview.activeQueue || 0, fill: '#FFBB28' },
                        { name: 'Completed', value: stats?.overview.completedToday || 0, fill: '#00C49F' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Waiting', value: stats?.overview.waitingPatients || 0, fill: '#FF8042' },
                        { name: 'Active Queue', value: stats?.overview.activeQueue || 0, fill: '#FFBB28' },
                        { name: 'Completed', value: stats?.overview.completedToday || 0, fill: '#00C49F' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                  {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                    stats.recentActivities.map((activity) => (
                      <div key={activity._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Patient {activity.patientId?.name || 'Unknown'} - Queue #{activity.queueNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dr. {activity.doctorId?.name || 'Unknown'} • Status: {activity.status}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.updatedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No recent activities today
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
