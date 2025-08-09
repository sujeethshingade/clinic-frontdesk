import { api } from './api-client'

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'admin' | 'receptionist' | 'doctor' | 'patient'
}

export interface AuthResponse {
  message: string
  user: {
    id: string
    firstName?: string
    lastName?: string
    email: string
    role: string
  }
  token: string
}

// Auth service
export const authService = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
}

// Doctor types
export interface Doctor {
  _id: string
  email: string
  firstName: string
  lastName: string
  specialization: string
  licenseNumber: string
  phone: string
  qualifications: string[]
  experience: number
  consultationFee: number
  availability: Record<string, { start: string; end: string }>
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateDoctorRequest {
  email: string
  firstName: string
  lastName: string
  specialization: string
  licenseNumber: string
  phone: string
  qualifications: string[]
  experience: number
  consultationFee: number
  availability?: Record<string, { start: string; end: string }>
}

export interface DoctorsResponse {
  doctors: Doctor[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Doctor service
export const doctorService = {
  getAll: (params?: {
    page?: number
    limit?: number
    search?: string
    specialization?: string
    status?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.specialization) searchParams.append('specialization', params.specialization)
    if (params?.status) searchParams.append('status', params.status)
    
    const query = searchParams.toString()
    return api.get<DoctorsResponse>(`/doctors${query ? `?${query}` : ''}`)
  },
  
  getById: (id: string) => api.get<{ doctor: Doctor }>(`/doctors/${id}`),
  create: (data: CreateDoctorRequest) => api.post<{ message: string; doctor: Doctor }>('/doctors', data),
  update: (id: string, data: Partial<CreateDoctorRequest>) => 
    api.put<{ message: string; doctor: Doctor }>(`/doctors/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/doctors/${id}`),
}

// Patient types
export interface Patient {
  _id: string
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  phone: string
  email: string
  address?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  medicalHistory: string[]
  allergies: string[]
  medications: string[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreatePatientRequest {
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  phone: string
  address?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  medicalHistory?: string[]
  allergies?: string[]
  medications?: string[]
}

export interface PatientsResponse {
  patients: Patient[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Patient service
export const patientService = {
  getAll: (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    
    const query = searchParams.toString()
    return api.get<PatientsResponse>(`/patients${query ? `?${query}` : ''}`)
  },
  
  getById: (id: string) => api.get<{ patient: Patient }>(`/patients/${id}`),
  create: (data: CreatePatientRequest) => api.post<{ message: string; patient: Patient }>('/patients', data),
  update: (id: string, data: Partial<CreatePatientRequest>) => 
    api.put<{ message: string; patient: Patient }>(`/patients/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/patients/${id}`),
}

// Queue types
export interface QueueEntry {
  _id: string
  patient: {
    _id: string
    firstName: string
    lastName: string
    patientId: string
  }
  doctor: {
    _id: string
    firstName: string
    lastName: string
    specialization: string
  }
  queueNumber: number
  priority: 'normal' | 'high' | 'urgent'
  reason?: string
  notes?: string
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled'
  calledAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateQueueRequest {
  patientId: string
  doctorId: string
  priority?: 'normal' | 'high' | 'urgent'
  reason?: string
  notes?: string
}

// Queue service
export const queueService = {
  getAll: (params?: {
    doctorId?: string
    status?: string
    date?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.doctorId) searchParams.append('doctorId', params.doctorId)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.date) searchParams.append('date', params.date)
    
    const query = searchParams.toString()
    return api.get<{ queue: QueueEntry[] }>(`/queue${query ? `?${query}` : ''}`)
  },
  
  getById: (id: string) => api.get<{ queueEntry: QueueEntry }>(`/queue/${id}`),
  create: (data: CreateQueueRequest) => api.post<{ message: string; queueEntry: QueueEntry }>('/queue', data),
  update: (id: string, data: { status?: string; notes?: string }) => 
    api.put<{ message: string; queueEntry: QueueEntry }>(`/queue/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/queue/${id}`),
}

// Appointment types
export interface Appointment {
  _id: string
  patient: {
    _id: string
    firstName: string
    lastName: string
    patientId: string
    phone: string
    email: string
  }
  doctor: {
    _id: string
    firstName: string
    lastName: string
    specialization: string
  }
  appointmentDate: string
  appointmentTime: string
  type: 'consultation' | 'follow-up' | 'emergency'
  reason?: string
  notes?: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentRequest {
  patientId: string
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  type: 'consultation' | 'follow-up' | 'emergency'
  reason?: string
  notes?: string
}

export interface AppointmentsResponse {
  appointments: Appointment[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Appointment service
export const appointmentService = {
  getAll: (params?: {
    page?: number
    limit?: number
    doctorId?: string
    patientId?: string
    status?: string
    date?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.doctorId) searchParams.append('doctorId', params.doctorId)
    if (params?.patientId) searchParams.append('patientId', params.patientId)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.date) searchParams.append('date', params.date)
    
    const query = searchParams.toString()
    return api.get<AppointmentsResponse>(`/appointments${query ? `?${query}` : ''}`)
  },
  
  getById: (id: string) => api.get<{ appointment: Appointment }>(`/appointments/${id}`),
  create: (data: CreateAppointmentRequest) => api.post<{ message: string; appointment: Appointment }>('/appointments', data),
  update: (id: string, data: Partial<CreateAppointmentRequest>) => 
    api.put<{ message: string; appointment: Appointment }>(`/appointments/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/appointments/${id}`),
}

// Dashboard types
export interface DashboardStats {
  overview: {
    totalPatients: number
    totalDoctors: number
    todayQueue: number
    todayAppointments: number
    activeQueue: number
    completedToday: number
    upcomingAppointments: number
    waitingPatients: number
  }
  queueByDoctor: Array<{
    _id: string
    doctorName: string
    waiting: number
    inProgress: number
    completed: number
    total: number
  }>
  recentActivities: Array<{
    _id: string
    patient: {
      firstName: string
      lastName: string
      patientId: string
    }
    doctor: {
      firstName: string
      lastName: string
    }
    status: string
    queueNumber: number
    updatedAt: string
  }>
}

// Dashboard service
export const dashboardService = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
}
