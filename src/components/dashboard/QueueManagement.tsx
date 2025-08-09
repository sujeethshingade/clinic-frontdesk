'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { queueService, patientService, doctorService } from '@/lib/api'

interface QueueItem {
  _id: string
  queueNumber: number
  patient: {
    _id: string
    firstName: string
    lastName: string
    phone: string
  }
  doctor: {
    _id: string
    firstName: string
    lastName: string
    specialization: string
  }
  priority: 'normal' | 'high' | 'urgent'
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled'
  reason?: string
  notes?: string
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

export function QueueManagement() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal')
  const [reason, setReason] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [queueData, patientsData, doctorsData] = await Promise.all([
        queueService.getAll(),
        patientService.getAll(),
        doctorService.getAll()
      ])
      
      setQueue((queueData as any).queue || [])
      setPatients((patientsData as any).patients || [])
      setDoctors((doctorsData as any).doctors || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: QueueItem['status']) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="secondary">Waiting</Badge>
      case 'in-progress':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">In Progress</Badge>
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
    }
  }

  const getPriorityBadge = (priority: QueueItem['priority']) => {
    switch (priority) {
      case 'normal':
        return <Badge variant="outline">Normal</Badge>
      case 'high':
        return <Badge variant="secondary">High</Badge>
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>
    }
  }

  const filteredQueue = queue.filter(item => {
    const patientName = `${item.patient.firstName} ${item.patient.lastName}`
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.patient.phone.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateStatus = async (id: string, newStatus: QueueItem['status']) => {
    try {
      await queueService.update(id, { status: newStatus })
      setQueue(prev => prev.map(item => 
        item._id === id ? { ...item, status: newStatus } : item
      ))
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`)
    }
  }

  const removeFromQueue = async (id: string) => {
    if (!confirm('Are you sure you want to remove this patient from the queue?')) return
    
    try {
      await queueService.delete(id)
      setQueue(prev => prev.filter(item => item._id !== id))
    } catch (err: any) {
      alert(`Failed to remove from queue: ${err.message}`)
    }
  }

  const onAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPatientId || !selectedDoctorId) {
      alert('Please select both patient and doctor')
      return
    }

    try {
      const response = await queueService.create({
        patientId: selectedPatientId,
        doctorId: selectedDoctorId,
        priority,
        reason
      })
      
      setQueue(prev => [...prev, (response as any).queueEntry])
      setSelectedPatientId('')
      setSelectedDoctorId('')
      setPriority('normal')
      setReason('')
      setIsAddPatientOpen(false)
    } catch (err: any) {
      alert(`Failed to add patient to queue: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Queue</CardTitle>
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
          <CardTitle>Patient Queue</CardTitle>
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
          <CardTitle>Patient Queue</CardTitle>
          <CardDescription>Manage the patient waiting queue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
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
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Queue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Patient to Queue</DialogTitle>
                  <DialogDescription>
                    Add an existing patient to the waiting queue.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={onAddPatient} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient</Label>
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
                    <Label htmlFor="doctor">Doctor</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Input
                      id="reason"
                      placeholder="Reason for visit"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddPatientOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add to Queue</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Queue #</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No patients in queue
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQueue.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.queueNumber}</TableCell>
                      <TableCell>{item.patient.firstName} {item.patient.lastName}</TableCell>
                      <TableCell>{item.patient.phone}</TableCell>
                      <TableCell>Dr. {item.doctor.firstName} {item.doctor.lastName}</TableCell>
                      <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{item.reason || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {item.status === 'waiting' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(item._id, 'in-progress')}
                            >
                              Call In
                            </Button>
                          )}
                          {item.status === 'in-progress' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(item._id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromQueue(item._id)}
                          >
                            Remove
                          </Button>
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
