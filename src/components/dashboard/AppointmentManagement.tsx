'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { appointmentService, patientService, doctorService } from '@/lib/api'

interface Appointment {
  _id: string
  patient: {
    _id: string
    firstName: string
    lastName: string
    phone: string
    email: string
  }
  doctor: {
    _id: string
    firstName: string
    lastName: string
    specialization: string
  }
  appointmentDate: string
  appointmentTime: string
  type: 'consultation' | 'follow-up' | 'emergency'
  reason?: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

interface Patient {
  _id: string
  firstName: string
  lastName: string
  phone: string
  email: string
}

interface Doctor {
  _id: string
  firstName: string
  lastName: string
  specialization: string
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
]

export function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isBookAppointmentOpen, setIsBookAppointmentOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [appointmentType, setAppointmentType] = useState<'consultation' | 'follow-up' | 'emergency'>('consultation')
  const [reason, setReason] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [appointmentsData, patientsData, doctorsData] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll(),
        doctorService.getAll()
      ])
      
      setAppointments((appointmentsData as any).appointments || [])
      setPatients((patientsData as any).patients || [])
      setDoctors((doctorsData as any).doctors || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge>Scheduled</Badge>
      case 'confirmed':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Confirmed</Badge>
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
    }
  }

  const getTypeBadge = (type: Appointment['type']) => {
    switch (type) {
      case 'consultation':
        return <Badge variant="outline">Consultation</Badge>
      case 'follow-up':
        return <Badge variant="secondary">Follow-up</Badge>
      case 'emergency':
        return <Badge className="bg-red-500 hover:bg-red-600">Emergency</Badge>
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`
    const doctorName = `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patient.phone.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateStatus = async (id: string, newStatus: Appointment['status']) => {
    try {
      await appointmentService.update(id, { status: newStatus })
      setAppointments(prev => prev.map(appointment => 
        appointment._id === id ? { ...appointment, status: newStatus } : appointment
      ))
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`)
    }
  }

  const resetForm = () => {
    setSelectedPatientId('')
    setSelectedDoctorId('')
    setAppointmentDate('')
    setAppointmentTime('')
    setAppointmentType('consultation')
    setReason('')
  }

  const onBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPatientId || !selectedDoctorId || !appointmentDate || !appointmentTime) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const appointmentData = {
        patientId: selectedPatientId,
        doctorId: selectedDoctorId,
        appointmentDate,
        appointmentTime,
        type: appointmentType,
        reason
      }
      
      const response = await appointmentService.create(appointmentData)
      setAppointments(prev => [...prev, (response as any).appointment])
      
      resetForm()
      setIsBookAppointmentOpen(false)
    } catch (err: any) {
      alert(`Failed to book appointment: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment Management</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment Management</CardTitle>
          <CardDescription>Error: {error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadData}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appointment Management</CardTitle>
          <CardDescription>Schedule and manage patient appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isBookAppointmentOpen} onOpenChange={setIsBookAppointmentOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Book New Appointment</DialogTitle>
                  <DialogDescription>
                    Schedule a new appointment for a patient.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={onBookAppointment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient *</Label>
                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient._id} value={patient._id}>
                            {patient.firstName} {patient.lastName} - {patient.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor">Doctor *</Label>
                    <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor._id} value={doctor._id}>
                            Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Appointment Type</Label>
                    <Select value={appointmentType} onValueChange={(value: any) => setAppointmentType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Input
                      id="reason"
                      placeholder="Reason for appointment"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsBookAppointmentOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Book Appointment</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment._id}>
                      <TableCell className="font-medium">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </TableCell>
                      <TableCell>{appointment.patient.phone}</TableCell>
                      <TableCell>Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}</TableCell>
                      <TableCell>{new Date(appointment.appointmentDate).toLocaleDateString()}</TableCell>
                      <TableCell>{appointment.appointmentTime}</TableCell>
                      <TableCell>{getTypeBadge(appointment.type)}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateStatus(appointment._id, 'confirmed')}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateStatus(appointment._id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {appointment.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(appointment._id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
