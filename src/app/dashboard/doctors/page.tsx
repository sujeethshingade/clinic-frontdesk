'use client'

import { DoctorManagement } from '@/components/dashboard/DoctorManagement'

export default function DoctorsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Doctor Management</h1>
        <p className="text-muted-foreground">Manage doctor profiles and availability</p>
      </div>
      <DoctorManagement />
    </div>
  )
}
