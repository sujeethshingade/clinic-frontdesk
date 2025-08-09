// API configuration and utilities
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Auth token management
let authToken: string | null = null

export const setAuthToken = (token: string) => {
  authToken = token
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token)
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

// API request wrapper
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getAuthToken()

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    let data
    try {
      data = await response.json()
    } catch (parseError) {
      throw new Error(`Invalid response format from server`)
    }

    if (!response.ok) {
      // Handle specific HTTP status codes
      switch (response.status) {
        case 401:
          // Clear token on unauthorized
          clearAuthToken()
          throw new Error('Unauthorized - Invalid credentials')
        case 403:
          throw new Error('Access forbidden - Insufficient permissions')
        case 404:
          throw new Error('Resource not found')
        case 422:
          throw new Error(data.message || 'Validation error')
        case 500:
          throw new Error('Server error - Please try again later')
        default:
          throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`)
      }
    }

    return data
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error)
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error - Please check your connection')
    }
    
    throw error
  }
}

// HTTP methods
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  
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
