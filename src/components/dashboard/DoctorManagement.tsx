'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, MapPin, AlertCircle } from 'lucide-react'
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
import { useDoctors, useCreateDoctor, useUpdateDoctor, useDeleteDoctor } from '@/hooks/useApi'
import { Doctor } from '@/lib/services'

const doctorSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  specialization: z.string().min(1, 'Specialization is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  phone: z.string().min(10, 'Phone number is required'),
  qualifications: z.array(z.string()).min(1, 'At least one qualification is required'),
  experience: z.number().min(0, 'Experience must be a positive number'),
  consultationFee: z.number().min(0, 'Consultation fee must be a positive number'),
  availability: z.record(z.string(), z.object({
    start: z.string(),
    end: z.string()
  })).optional()
})

type DoctorFormData = z.infer<typeof doctorSchema>

const specializations = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Gynecology',
  'Neurology',
  'Psychiatry',
  'Ophthalmology',
  'ENT',
  'Radiology',
  'Pathology'
]

const qualificationOptions = [
  'MBBS', 'MD', 'MS', 'DNB', 'DM', 'MCh', 'FRCS', 'MRCP', 'FRCR', 'DMRD'
]

export function DoctorManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // API hooks
  const { data: doctorsData, loading, error, refetch } = useDoctors({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    specialization: specializationFilter !== 'all' ? specializationFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined
  })

  const createDoctor = useCreateDoctor()
  const updateDoctor = useUpdateDoctor()
  const deleteDoctor = useDeleteDoctor()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      qualifications: [],
      availability: {}
    }
  })

  const watchedQualifications = watch('qualifications') || []

  const getStatusBadge = (status: 'active' | 'inactive') => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>
    }
  }

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return
    
    try {
      await deleteDoctor.mutate(id)
      refetch()
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const onSubmitDoctor = async (data: DoctorFormData) => {
    try {
      // Prepare data with default availability if not provided
      const doctorData = {
        ...data,
        availability: data.availability || {}
      }

      if (editingDoctor) {
        await updateDoctor.mutate({ id: editingDoctor._id, data: doctorData })
      } else {
        await createDoctor.mutate(doctorData)
      }
      
      reset()
      setIsAddDoctorOpen(false)
      setEditingDoctor(null)
      refetch()
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  const startEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setValue('firstName', doctor.firstName)
    setValue('lastName', doctor.lastName)
    setValue('email', doctor.email)
    setValue('specialization', doctor.specialization)
    setValue('licenseNumber', doctor.licenseNumber)
    setValue('phone', doctor.phone)
    setValue('qualifications', doctor.qualifications)
    setValue('experience', doctor.experience)
    setValue('consultationFee', doctor.consultationFee)
    setValue('availability', doctor.availability)
    setIsAddDoctorOpen(true)
  }

  const handleDialogClose = () => {
    setIsAddDoctorOpen(false)
    setEditingDoctor(null)
    reset()
  }

  const addQualification = (qualification: string) => {
    if (!watchedQualifications.includes(qualification)) {
      setValue('qualifications', [...watchedQualifications, qualification])
    }
  }

  const removeQualification = (qualification: string) => {
    setValue('qualifications', watchedQualifications.filter(q => q !== qualification))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Doctor Management</CardTitle>
          <CardDescription>Loading doctors...</CardDescription>
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
          <CardTitle>Doctor Management</CardTitle>
          <CardDescription>Error loading doctors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <Button onClick={refetch} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const doctors = doctorsData?.doctors || []
  const pagination = doctorsData?.pagination

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Doctor Management</CardTitle>
          <CardDescription>Manage doctor profiles and information</CardDescription>
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isAddDoctorOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Doctor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDoctor ? 'Update doctor information.' : 'Add a new doctor to the clinic.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitDoctor)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        {...register('firstName')}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        {...register('lastName')}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive">{errors.lastName.message}</p>
                      )}
                    </div>
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
                  
                  <div className="grid grid-cols-2 gap-4">
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

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        placeholder="Enter license number"
                        {...register('licenseNumber')}
                      />
                      {errors.licenseNumber && (
                        <p className="text-sm text-destructive">{errors.licenseNumber.message}</p>
                      )}
                    </div>
                  </div>

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
                    <Label>Qualifications</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {watchedQualifications.map((qual) => (
                        <Badge 
                          key={qual} 
                          variant="secondary" 
                          className="cursor-pointer"
                          onClick={() => removeQualification(qual)}
                        >
                          {qual} ×
                        </Badge>
                      ))}
                    </div>
                    <Select onValueChange={addQualification}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualificationOptions
                          .filter(qual => !watchedQualifications.includes(qual))
                          .map((qual) => (
                            <SelectItem key={qual} value={qual}>{qual}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {errors.qualifications && (
                      <p className="text-sm text-destructive">{errors.qualifications.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience (years)</Label>
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        placeholder="Enter years of experience"
                        {...register('experience', { valueAsNumber: true })}
                      />
                      {errors.experience && (
                        <p className="text-sm text-destructive">{errors.experience.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consultationFee">Consultation Fee</Label>
                      <Input
                        id="consultationFee"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter consultation fee"
                        {...register('consultationFee', { valueAsNumber: true })}
                      />
                      {errors.consultationFee && (
                        <p className="text-sm text-destructive">{errors.consultationFee.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createDoctor.loading || updateDoctor.loading}
                    >
                      {createDoctor.loading || updateDoctor.loading 
                        ? 'Saving...' 
                        : editingDoctor ? 'Update Doctor' : 'Add Doctor'
                      }
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
                  <TableHead>Experience</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No doctors found. Add your first doctor to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  doctors.map((doctor) => (
                    <TableRow key={doctor._id}>
                      <TableCell className="font-medium">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doctor.specialization}</Badge>
                      </TableCell>
                      <TableCell>{doctor.phone}</TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell>{doctor.experience} years</TableCell>
                      <TableCell>${doctor.consultationFee}</TableCell>
                      <TableCell>{getStatusBadge(doctor.status)}</TableCell>
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
                            onClick={() => handleDeleteDoctor(doctor._id)}
                            disabled={deleteDoctor.loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                  disabled={currentPage === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
