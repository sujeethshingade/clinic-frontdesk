'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService, type AuthResponse } from '@/lib/services'
import { setAuthToken, clearAuthToken, getAuthToken } from '@/lib/api-client'

interface User {
  id: string
  firstName?: string
  lastName?: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<AuthResponse>
  register: (data: { firstName: string; lastName: string; email: string; password: string; role: 'admin' | 'receptionist' | 'doctor' | 'patient' }) => Promise<AuthResponse>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const token = getAuthToken()
    if (token) {
      try {
        const userData = localStorage.getItem('userData')
        if (userData) {
          setUser(JSON.parse(userData))
        }
      } catch (error) {
        console.error('Invalid stored user data:', error)
        clearAuthToken()
        localStorage.removeItem('userData')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // Basic validation
      if (!email.trim()) {
        throw new Error('Email is required')
      }
      if (!password.trim()) {
        throw new Error('Password is required')
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address')
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }

      const response = await authService.login({ email: email.trim().toLowerCase(), password })
      
      if (!response.token || !response.user) {
        throw new Error('Invalid response from server')
      }
      
      setAuthToken(response.token)
      setUser(response.user)
      
      // Store user data for persistence
      localStorage.setItem('userData', JSON.stringify(response.user))
      
      return response
    } catch (error) {
      console.error('Login failed:', error)
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.')
        }
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          throw new Error('Unable to connect to the server. Please check your internet connection.')
        }
        if (error.message.includes('timeout')) {
          throw new Error('Request timed out. Please try again.')
        }
        // If it's already a user-friendly message, keep it
        if (error.message.length < 100 && !error.message.includes('http')) {
          throw error
        }
      }
      
      throw new Error('Login failed. Please try again later.')
    }
  }

  const register = async (data: { firstName: string; lastName: string; email: string; password: string; role: 'admin' | 'receptionist' | 'doctor' | 'patient' }): Promise<AuthResponse> => {
    try {
      const response = await authService.register(data)
      
      if (!response.token || !response.user) {
        throw new Error('Invalid response from server')
      }
      
      setAuthToken(response.token)
      setUser(response.user)
      
      // Store user data for persistence
      localStorage.setItem('userData', JSON.stringify(response.user))
      
      return response
    } catch (error) {
      console.error('Registration failed:', error)
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('409') || error.message.includes('already exists')) {
          throw new Error('An account with this email already exists. Please try logging in instead.')
        }
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          throw new Error('Unable to connect to the server. Please check your internet connection.')
        }
        if (error.message.includes('timeout')) {
          throw new Error('Request timed out. Please try again.')
        }
        // If it's already a user-friendly message, keep it
        if (error.message.length < 100 && !error.message.includes('http')) {
          throw error
        }
      }
      
      throw new Error('Registration failed. Please try again later.')
    }
  }

  const logout = () => {
    clearAuthToken()
    localStorage.removeItem('userData')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register,
      logout, 
      loading, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  )
}
