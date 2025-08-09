'use client'

import { QueueManagement } from '@/components/dashboard/QueueManagement'

export default function QueuePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Queue Management</h1>
        <p className="text-muted-foreground">Manage patient waiting queue</p>
      </div>
      <QueueManagement />
    </div>
  )
}
