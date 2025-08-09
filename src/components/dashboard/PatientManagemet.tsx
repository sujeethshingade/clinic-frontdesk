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
import { patientService } from '@/lib/api'

interface Patient {
  _id: string
  patientId: string
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth?: string
  gender: string
  emergencyContact: string
  medicalHistory: string
  createdAt: string
}

const genderOptions = ['male', 'female', 'other']

export function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState<string>('all')
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [medicalHistory, setMedicalHistory] = useState('')

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const response = await patientService.getAll()
      setPatients((response as any).data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setAddress('')
    setDateOfBirth('')
    setGender('')
    setEmergencyContact('')
    setMedicalHistory('')
  }

  const fillForm = (patient: Patient) => {
    setName(patient.name)
    setEmail(patient.email)
    setPhone(patient.phone)
    setAddress(patient.address)
    setDateOfBirth(patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '')
    setGender(patient.gender)
    setEmergencyContact(patient.emergencyContact)
    setMedicalHistory(patient.medicalHistory)
  }

  const getGenderBadge = (gender: string) => {
    if (!gender) return null
    return (
      <Badge variant="secondary">
        {gender.charAt(0).toUpperCase() + gender.slice(1)}
      </Badge>
    )
  }

  const handleDeletePatient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return
    
    try {
      await patientService.delete(id)
      setPatients(prev => prev.filter(patient => patient._id !== id))
    } catch (err: any) {
      alert(`Failed to delete patient: ${err.message}`)
    }
  }

  const onSubmitPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !phone) {
      alert('Please fill in all required fields')
      return
    }

    const patientData = {
      name,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      emergencyContact,
      medicalHistory,
    }

    try {
      if (editingPatient) {
        const response = await patientService.update(editingPatient._id, patientData)
        setPatients(prev => prev.map(patient => 
          patient._id === editingPatient._id ? (response as any).patient || (response as any).data : patient
        ))
      } else {
        const response = await patientService.create(patientData)
        setPatients(prev => [...prev, (response as any).patient || (response as any).data])
      }
      
      resetForm()
      setIsAddPatientOpen(false)
      setEditingPatient(null)
    } catch (err: any) {
      alert(`Failed to ${editingPatient ? 'update' : 'create'} patient: ${err.message}`)
    }
  }

  const startEdit = (patient: Patient) => {
    setEditingPatient(patient)
    fillForm(patient)
    setIsAddPatientOpen(true)
  }

  const handleAddClick = () => {
    resetForm()
    setEditingPatient(null)
    setIsAddPatientOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsAddPatientOpen(open)
    if (!open) {
      setEditingPatient(null)
      resetForm()
    }
  }

  const handleDialogCancel = () => {
    setIsAddPatientOpen(false)
    setEditingPatient(null)
    resetForm()
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm) ||
                         patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGender = genderFilter === 'all' || patient.gender === genderFilter
    return matchesSearch && matchesGender
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Management</CardTitle>
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
          <CardTitle>Patient Management</CardTitle>
          <CardDescription>Error: {error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadPatients}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Patient Management</CardTitle>
          <CardDescription>Manage patient records and information</CardDescription>
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
            
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                {genderOptions.map((genderOption) => (
                  <SelectItem key={genderOption} value={genderOption}>
                    {genderOption.charAt(0).toUpperCase() + genderOption.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isAddPatientOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button onClick={handleAddClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPatient ? 'Edit Patient' : 'Add New Patient'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPatient ? 'Update patient information.' : 'Add a new patient to the clinic.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmitPatient} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((genderOption) => (
                            <SelectItem key={genderOption} value={genderOption}>
                              {genderOption.charAt(0).toUpperCase() + genderOption.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        placeholder="Enter emergency contact"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory">Medical History</Label>
                    <textarea
                      id="medicalHistory"
                      value={medicalHistory}
                      onChange={(e) => setMedicalHistory(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      rows={3}
                      placeholder="Any relevant medical history..."
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleDialogCancel}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingPatient ? 'Update Patient' : 'Add Patient'}
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
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No patients found. Add your first patient to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient._id}>
                      <TableCell>
                        <Badge variant="outline">{patient.patientId}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>{getGenderBadge(patient.gender)}</TableCell>
                      <TableCell>
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(patient)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePatient(patient._id)}
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
