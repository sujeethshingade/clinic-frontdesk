'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/doctors': 'Doctor Management',
  '/dashboard/patients': 'Patient Management',
  '/dashboard/queue': 'Queue Management',
  '/dashboard/appointments': 'Appointment Management',
  '/dashboard/settings': 'Settings',
}

export function Header() {
  const pathname = usePathname()
  const { user } = useAuth()
  
  const currentPage = pageNames[pathname] || 'Dashboard'

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold md:ml-0 ml-12">
            {currentPage}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 w-64"
            />
          </div>

          {/* Notifications */}
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>

          {/* User avatar */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              {user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:block text-sm">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email
              }
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
