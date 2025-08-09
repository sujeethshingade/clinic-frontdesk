'use client'

import React, { createContext, useContext, useEffect } from 'react'

interface ThemeContextType {
  theme: 'dark'
  effectiveTheme: 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Always set dark mode
    const root = window.document.documentElement
    root.classList.remove('light')
    root.classList.add('dark')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'dark', effectiveTheme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}
