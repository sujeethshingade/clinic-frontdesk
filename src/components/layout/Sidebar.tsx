'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Stethoscope, 
  Calendar, 
  Clock, 
  LogOut,
  Menu,
  X,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Doctors', href: '/dashboard/doctors', icon: Stethoscope },
  { name: 'Patients', href: '/dashboard/patients', icon: Users },
  { name: 'Queue', href: '/dashboard/queue', icon: Clock },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
]

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border shadow-lg transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 border-b border-border">
            <h1 className="text-xl font-bold">Allo Health Clinic</h1>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-border">

          {user && (
            <div className="p-2 bg-muted/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.email
                    }
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={logout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
