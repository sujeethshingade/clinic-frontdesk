'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, MapPin } from 'lucide-react'
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

const doctorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  location: z.string().min(1, 'Location is required'),
  availability: z.enum(['available', 'busy', 'unavailable']),
})

type DoctorFormData = z.infer<typeof doctorSchema>

interface Doctor {
  id: string
  name: string
  specialization: string
  phone: string
  email: string
  location: string
  availability: 'available' | 'busy' | 'unavailable'
  patientsToday: number
}

const dummyDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Smith',
    specialization: 'General Medicine',
    phone: '+1 (555) 111-1111',
    email: 'sarah.smith@clinic.com',
    location: 'Room 101',
    availability: 'available',
    patientsToday: 5
  },
  {
    id: '2',
    name: 'Dr. Michael Johnson',
    specialization: 'Cardiology',
    phone: '+1 (555) 222-2222',
    email: 'michael.johnson@clinic.com',
    location: 'Room 205',
    availability: 'busy',
    patientsToday: 8
  },
  {
    id: '3',
    name: 'Dr. Emily Brown',
    specialization: 'Dermatology',
    phone: '+1 (555) 333-3333',
    email: 'emily.brown@clinic.com',
    location: 'Room 302',
    availability: 'available',
    patientsToday: 3
  },
  {
    id: '4',
    name: 'Dr. David Wilson',
    specialization: 'Orthopedics',
    phone: '+1 (555) 444-4444',
    email: 'david.wilson@clinic.com',
    location: 'Room 150',
    availability: 'unavailable',
    patientsToday: 0
  }
]

const specializations = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Gynecology',
  'Neurology',
  'Psychiatry'
]

export function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>(dummyDoctors)
  const [searchTerm, setSearchTerm] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
  })

  const getAvailabilityBadge = (availability: Doctor['availability']) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
      case 'busy':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Busy</Badge>
      case 'unavailable':
        return <Badge variant="destructive">Unavailable</Badge>
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = specializationFilter === 'all' || doctor.specialization === specializationFilter
    const matchesAvailability = availabilityFilter === 'all' || doctor.availability === availabilityFilter
    return matchesSearch && matchesSpecialization && matchesAvailability
  })

  const updateAvailability = (id: string, newAvailability: Doctor['availability']) => {
    setDoctors(prev => prev.map(doctor => 
      doctor.id === id ? { ...doctor, availability: newAvailability } : doctor
    ))
  }

  const deleteDoctor = (id: string) => {
    setDoctors(prev => prev.filter(doctor => doctor.id !== id))
  }

  const onSubmitDoctor = (data: DoctorFormData) => {
    if (editingDoctor) {
      // Update existing doctor
      setDoctors(prev => prev.map(doctor => 
        doctor.id === editingDoctor.id 
          ? { ...doctor, ...data }
          : doctor
      ))
      setEditingDoctor(null)
    } else {
      // Add new doctor
      const newDoctor: Doctor = {
        id: Date.now().toString(),
        ...data,
        patientsToday: 0
      }
      setDoctors(prev => [...prev, newDoctor])
    }
    
    reset()
    setIsAddDoctorOpen(false)
  }

  const startEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setValue('name', doctor.name)
    setValue('specialization', doctor.specialization)
    setValue('phone', doctor.phone)
    setValue('email', doctor.email)
    setValue('location', doctor.location)
    setValue('availability', doctor.availability)
    setIsAddDoctorOpen(true)
  }

  const handleDialogClose = () => {
    setIsAddDoctorOpen(false)
    setEditingDoctor(null)
    reset()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Doctor Management</CardTitle>
          <CardDescription>Manage doctor profiles and availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isAddDoctorOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Doctor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDoctor ? 'Update doctor information.' : 'Add a new doctor to the clinic.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitDoctor)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Doctor Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter doctor name"
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select onValueChange={(value) => setValue('specialization', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {specializations.map((spec) => (
                          <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.specialization && (
                      <p className="text-sm text-destructive">{errors.specialization.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
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
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Room 101"
                        {...register('location')}
                      />
                      {errors.location && (
                        <p className="text-sm text-destructive">{errors.location.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      <Select onValueChange={(value) => setValue('availability', value as 'available' | 'busy' | 'unavailable')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="unavailable">Unavailable</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.availability && (
                        <p className="text-sm text-destructive">{errors.availability.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Patients Today</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{doctor.specialization}</Badge>
                    </TableCell>
                    <TableCell>{doctor.phone}</TableCell>
                    <TableCell>{doctor.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        {doctor.location}
                      </div>
                    </TableCell>
                    <TableCell>{getAvailabilityBadge(doctor.availability)}</TableCell>
                    <TableCell>{doctor.patientsToday}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(doctor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteDoctor(doctor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
