'use client'

import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

const toasts: Toast[] = []
const listeners: Array<(toasts: Toast[]) => void> = []

let toastCount = 0

export const useToast = () => {
  const [, forceUpdate] = useState({})

  const refresh = useCallback(() => {
    forceUpdate({})
  }, [])

  const toast = useCallback(
    ({ ...props }: Omit<Toast, 'id'>) => {
      const id = (++toastCount).toString()
      const toast: Toast = {
        ...props,
        id,
      }

      toasts.push(toast)
      listeners.forEach((listener) => listener(toasts))

      // Auto remove after 5 seconds
      setTimeout(() => {
        const index = toasts.findIndex((t) => t.id === id)
        if (index > -1) {
          toasts.splice(index, 1)
          listeners.forEach((listener) => listener(toasts))
        }
      }, 5000)

      return {
        id,
        dismiss: () => {
          const index = toasts.findIndex((t) => t.id === id)
          if (index > -1) {
            toasts.splice(index, 1)
            listeners.forEach((listener) => listener(toasts))
          }
        },
      }
    },
    []
  )

  return {
    toast,
    toasts,
  }
}
