const API_BASE = '/api'

let authToken: string | null = null

export const setAuthToken = (token: string | null) => {
  authToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('authToken', token)
    } else {
      localStorage.removeItem('authToken')
    }
  }
}

export const getAuthToken = (): string | null => {
  if (authToken) return authToken
  
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('authToken')
  }
  
  return authToken
}

export const clearAuthToken = () => {
  authToken = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken()
    }
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data?: any) => 
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: <T>(endpoint: string, data?: any) => 
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(endpoint: string) => 
    apiRequest<T>(endpoint, { method: 'DELETE' }),
}

export const doctorService = {
  getAll: () => api.get('/doctors'),
  getById: (id: string) => api.get(`/doctors/${id}`),
  create: (data: any) => api.post('/doctors', data),
  update: (id: string, data: any) => api.put(`/doctors/${id}`, data),
  delete: (id: string) => api.delete(`/doctors/${id}`),
}

export const patientService = {
  getAll: () => api.get('/patients'),
  getById: (id: string) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients', data),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data),
  delete: (id: string) => api.delete(`/patients/${id}`),
}

export const appointmentService = {
  getAll: () => api.get('/appointments'),
  getById: (id: string) => api.get(`/appointments/${id}`),
  create: (data: any) => api.post('/appointments', data),
  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
}

export const queueService = {
  getAll: () => api.get('/queue'),
  getById: (id: string) => api.get(`/queue/${id}`),
  create: (data: any) => api.post('/queue', data),
  update: (id: string, data: any) => api.put(`/queue/${id}`, data),
  delete: (id: string) => api.delete(`/queue/${id}`),
}

export const authService = {
  login: async (email: string, password: string) => {
    const result = await apiRequest<{token: string}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    if (result.token) {
      setAuthToken(result.token)
    }
    return result
  },
  logout: () => {
    setAuthToken(null)
  }
}

export const dashboardService = {
  getStats: async () => {
    return await apiRequest<any>('/dashboard/stats')
  }
}

