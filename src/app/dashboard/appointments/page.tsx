'use client'

import { AppointmentManagement } from '@/components/dashboard/AppointmentManagement'

export default function AppointmentsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Appointment Management</h1>
        <p className="text-muted-foreground">Schedule and manage patient appointments</p>
      </div>
      <AppointmentManagement />
    </div>
  )
}
