'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { doctorService } from '@/lib/api'

interface Doctor {
  _id: string
  firstName: string
  lastName: string
  email: string
  specialization: string
  licenseNumber: string
  phone: string
  qualifications: string[]
  experience: number
  consultationFee: number
  status: 'active' | 'inactive'
  createdAt: string
}

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
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState<string>('all')
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedQualifications, setSelectedQualifications] = useState<string[]>([])
  const [experience, setExperience] = useState('')
  const [consultationFee, setConsultationFee] = useState('')

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const response = await doctorService.getAll()
      setDoctors((response as any).doctors || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setSpecialization('')
    setLicenseNumber('')
    setPhone('')
    setSelectedQualifications([])
    setExperience('')
    setConsultationFee('')
  }

  const fillForm = (doctor: Doctor) => {
    setFirstName(doctor.firstName)
    setLastName(doctor.lastName)
    setEmail(doctor.email)
    setSpecialization(doctor.specialization)
    setLicenseNumber(doctor.licenseNumber)
    setPhone(doctor.phone)
    setSelectedQualifications(doctor.qualifications)
    setExperience(doctor.experience.toString())
    setConsultationFee(doctor.consultationFee.toString())
  }

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
      await doctorService.delete(id)
      setDoctors(prev => prev.filter(doctor => doctor._id !== id))
    } catch (err: any) {
      alert(`Failed to delete doctor: ${err.message}`)
    }
  }

  const onSubmitDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!firstName || !lastName || !email || !specialization || !licenseNumber || !phone) {
      alert('Please fill in all required fields')
      return
    }

    const doctorData = {
      firstName,
      lastName,
      email,
      specialization,
      licenseNumber,
      phone,
      qualifications: selectedQualifications,
      experience: parseInt(experience) || 0,
      consultationFee: parseFloat(consultationFee) || 0,
    }

    try {
      if (editingDoctor) {
        const response = await doctorService.update(editingDoctor._id, doctorData)
        setDoctors(prev => prev.map(doctor => 
          doctor._id === editingDoctor._id ? (response as any).doctor : doctor
        ))
      } else {
        const response = await doctorService.create(doctorData)
        setDoctors(prev => [...prev, (response as any).doctor])
      }
      
      resetForm()
      setIsAddDoctorOpen(false)
      setEditingDoctor(null)
    } catch (err: any) {
      alert(`Failed to ${editingDoctor ? 'update' : 'create'} doctor: ${err.message}`)
    }
  }

  const startEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    fillForm(doctor)
    setIsAddDoctorOpen(true)
  }

  const handleDialogClose = () => {
    setIsAddDoctorOpen(false)
    setEditingDoctor(null)
    resetForm()
  }

  const addQualification = (qualification: string) => {
    if (!selectedQualifications.includes(qualification)) {
      setSelectedQualifications([...selectedQualifications, qualification])
    }
  }

  const removeQualification = (qualification: string) => {
    setSelectedQualifications(selectedQualifications.filter(q => q !== qualification))
  }

  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.phone.includes(searchTerm)
    const matchesSpecialization = specializationFilter === 'all' || doctor.specialization === specializationFilter
    return matchesSearch && matchesSpecialization
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Doctor Management</CardTitle>
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
          <CardTitle>Doctor Management</CardTitle>
          <CardDescription>Error: {error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadDoctors}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

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
                <form onSubmit={onSubmitDoctor} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization *</Label>
                      <Select value={specialization} onValueChange={setSpecialization}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          {specializations.map((spec) => (
                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number *</Label>
                      <Input
                        id="licenseNumber"
                        placeholder="Enter license number"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Qualifications</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedQualifications.map((qual) => (
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
                          .filter(qual => !selectedQualifications.includes(qual))
                          .map((qual) => (
                            <SelectItem key={qual} value={qual}>{qual}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience (years)</Label>
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        placeholder="Enter years of experience"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consultationFee">Consultation Fee</Label>
                      <Input
                        id="consultationFee"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter consultation fee"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                      />
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
                  <TableHead>Experience</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No doctors found. Add your first doctor to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor) => (
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
        </CardContent>
      </Card>
    </div>
  )
}
