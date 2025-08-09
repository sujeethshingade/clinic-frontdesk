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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const addPatientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone number is required'),
  priority: z.enum(['low', 'medium', 'high']),
})

type AddPatientFormData = z.infer<typeof addPatientSchema>

interface QueueItem {
  id: string
  queueNumber: number
  patientName: string
  phone: string
  arrivalTime: string
  estimatedWait: string
  status: 'waiting' | 'with-doctor' | 'completed'
  priority: 'low' | 'medium' | 'high'
}

const dummyQueue: QueueItem[] = [
  {
    id: '1',
    queueNumber: 1,
    patientName: 'John Doe',
    phone: '+1 (555) 123-4567',
    arrivalTime: '09:00 AM',
    estimatedWait: '15 mins',
    status: 'with-doctor',
    priority: 'high'
  },
  {
    id: '2',
    queueNumber: 2,
    patientName: 'Jane Smith',
    phone: '+1 (555) 234-5678',
    arrivalTime: '09:15 AM',
    estimatedWait: '30 mins',
    status: 'waiting',
    priority: 'medium'
  },
  {
    id: '3',
    queueNumber: 3,
    patientName: 'Bob Johnson',
    phone: '+1 (555) 345-6789',
    arrivalTime: '09:30 AM',
    estimatedWait: '45 mins',
    status: 'waiting',
    priority: 'low'
  }
]

export function QueueManagement() {
  const [queue, setQueue] = useState<QueueItem[]>(dummyQueue)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddPatientFormData>({
    resolver: zodResolver(addPatientSchema),
  })

  const getStatusBadge = (status: QueueItem['status']) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="secondary">Waiting</Badge>
      case 'with-doctor':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">With Doctor</Badge>
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
    }
  }

  const getPriorityBadge = (priority: QueueItem['priority']) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline">Low</Badge>
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>
      case 'high':
        return <Badge variant="destructive">High</Badge>
    }
  }

  const filteredQueue = queue.filter(item => {
    const matchesSearch = item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.phone.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateStatus = (id: string, newStatus: QueueItem['status']) => {
    setQueue(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ))
  }

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id))
  }

  const onAddPatient = (data: AddPatientFormData) => {
    const newPatient: QueueItem = {
      id: Date.now().toString(),
      queueNumber: queue.length + 1,
      patientName: data.name,
      phone: data.phone,
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedWait: `${(queue.length + 1) * 15} mins`,
      status: 'waiting',
      priority: data.priority,
    }
    
    setQueue(prev => [...prev, newPatient])
    reset()
    setIsAddPatientOpen(false)
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
                <SelectItem value="with-doctor">With Doctor</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Patient to Queue</DialogTitle>
                  <DialogDescription>
                    Enter patient details to add them to the waiting queue.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onAddPatient)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Patient Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter patient name"
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      {...register('phone')}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select onValueChange={(value) => register('priority').onChange({ target: { value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.priority && (
                      <p className="text-sm text-destructive">{errors.priority.message}</p>
                    )}
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
                  <TableHead>Arrival Time</TableHead>
                  <TableHead>Estimated Wait</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueue.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.queueNumber}</TableCell>
                    <TableCell>{item.patientName}</TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell>{item.arrivalTime}</TableCell>
                    <TableCell>{item.estimatedWait}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {item.status === 'waiting' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(item.id, 'with-doctor')}
                          >
                            Call In
                          </Button>
                        )}
                        {item.status === 'with-doctor' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(item.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromQueue(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
