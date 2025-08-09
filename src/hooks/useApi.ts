'use client'

import { useState, useEffect } from 'react'
import { 
  doctorService, 
  patientService, 
  queueService, 
  appointmentService, 
  dashboardService,
  type Doctor,
  type Patient,
  type QueueEntry,
  type Appointment,
  type DashboardStats
} from '@/lib/services'

// Generic hook for data fetching with loading and error states
export function useAsyncData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFunction()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refetch()
  }, dependencies)

  return { data, loading, error, refetch }
}

// Doctors hooks
export function useDoctors(params?: {
  page?: number
  limit?: number
  search?: string
  specialization?: string
  status?: string
}) {
  return useAsyncData(
    () => doctorService.getAll(params),
    [params?.page, params?.limit, params?.search, params?.specialization, params?.status]
  )
}

export function useDoctor(id: string | null) {
  return useAsyncData(
    () => id ? doctorService.getById(id) : Promise.resolve(null),
    [id]
  )
}

// Patients hooks
export function usePatients(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) {
  return useAsyncData(
    () => patientService.getAll(params),
    [params?.page, params?.limit, params?.search, params?.status]
  )
}

export function usePatient(id: string | null) {
  return useAsyncData(
    () => id ? patientService.getById(id) : Promise.resolve(null),
    [id]
  )
}

// Queue hooks
export function useQueue(params?: {
  doctorId?: string
  status?: string
  date?: string
}) {
  return useAsyncData(
    () => queueService.getAll(params),
    [params?.doctorId, params?.status, params?.date]
  )
}

export function useQueueEntry(id: string | null) {
  return useAsyncData(
    () => id ? queueService.getById(id) : Promise.resolve(null),
    [id]
  )
}

// Appointments hooks
export function useAppointments(params?: {
  page?: number
  limit?: number
  doctorId?: string
  patientId?: string
  status?: string
  date?: string
}) {
  return useAsyncData(
    () => appointmentService.getAll(params),
    [params?.page, params?.limit, params?.doctorId, params?.patientId, params?.status, params?.date]
  )
}

export function useAppointment(id: string | null) {
  return useAsyncData(
    () => id ? appointmentService.getById(id) : Promise.resolve(null),
    [id]
  )
}

// Dashboard hooks
export function useDashboardStats() {
  return useAsyncData(() => dashboardService.getStats())
}

// Mutation hooks for create/update/delete operations
export function useMutation<T, U>(
  mutationFunction: (data: T) => Promise<U>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (data: T): Promise<U> => {
    try {
      setLoading(true)
      setError(null)
      const result = await mutationFunction(data)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

// Specific mutation hooks
export function useCreateDoctor() {
  return useMutation(doctorService.create)
}

export function useUpdateDoctor() {
  return useMutation(({ id, data }: { id: string; data: any }) => 
    doctorService.update(id, data)
  )
}

export function useDeleteDoctor() {
  return useMutation(doctorService.delete)
}

export function useCreatePatient() {
  return useMutation(patientService.create)
}

export function useUpdatePatient() {
  return useMutation(({ id, data }: { id: string; data: any }) => 
    patientService.update(id, data)
  )
}

export function useDeletePatient() {
  return useMutation(patientService.delete)
}

export function useCreateQueueEntry() {
  return useMutation(queueService.create)
}

export function useUpdateQueueEntry() {
  return useMutation(({ id, data }: { id: string; data: any }) => 
    queueService.update(id, data)
  )
}

export function useDeleteQueueEntry() {
  return useMutation(queueService.delete)
}

export function useCreateAppointment() {
  return useMutation(appointmentService.create)
}

export function useUpdateAppointment() {
  return useMutation(({ id, data }: { id: string; data: any }) => 
    appointmentService.update(id, data)
  )
}

export function useDeleteAppointment() {
  return useMutation(appointmentService.delete)
}
