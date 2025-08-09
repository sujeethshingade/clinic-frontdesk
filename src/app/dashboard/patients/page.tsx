'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Search, Edit, Trash2 } from 'lucide-react'
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

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    medicalHistory: ''
  })

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response: any = await patientService.getAll()
      setPatients(response.data || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await patientService.create(formData)
      setIsAddDialogOpen(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        emergencyContact: '',
        medicalHistory: ''
      })
      fetchPatients()
    } catch (error) {
      console.error('Error adding patient:', error)
    }
  }

  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    try {
      await patientService.update(selectedPatient._id, formData)
      setIsEditDialogOpen(false)
      setSelectedPatient(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        emergencyContact: '',
        medicalHistory: ''
      })
      fetchPatients()
    } catch (error) {
      console.error('Error updating patient:', error)
    }
  }

  const handleDeletePatient = async (id: string) => {
    if (confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientService.delete(id)
        fetchPatients()
      } catch (error) {
        console.error('Error deleting patient:', error)
      }
    }
  }

  const openEditDialog = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
      gender: patient.gender,
      emergencyContact: patient.emergencyContact,
      medicalHistory: patient.medicalHistory
    })
    setIsEditDialogOpen(true)
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const PatientForm = ({ onSubmit, title }: { onSubmit: (e: React.FormEvent) => void, title: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            value={formData.emergencyContact}
            onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </div>
      <div>
        <Label htmlFor="medicalHistory">Medical History</Label>
        <textarea
          id="medicalHistory"
          value={formData.medicalHistory}
          onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
          placeholder="Any relevant medical history..."
        />
      </div>
      <Button type="submit" className="w-full">
        {title}
      </Button>
    </form>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">Manage patient records</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <PatientForm onSubmit={handleAddPatient} title="Add Patient" />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              All Patients ({filteredPatients.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No patients found matching your search.' : 'No patients registered yet.'}
            </div>
          ) : (
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
                {filteredPatients.map((patient) => (
                  <TableRow key={patient._id}>
                    <TableCell>
                      <Badge variant="outline">{patient.patientId}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>
                      {patient.gender && (
                        <Badge variant="secondary">
                          {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(patient)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePatient(patient._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          <PatientForm onSubmit={handleEditPatient} title="Update Patient" />
        </DialogContent>
      </Dialog>
    </div>
  )
}
