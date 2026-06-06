import { createContext, useState, useCallback } from 'react'
import { getUserIdFromToken } from '../utils/token'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback((userData, token) => {
    const id = getUserIdFromToken(token)
    const enriched = { ...userData, id }
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(enriched))
    setUser(enriched)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'Admin'
  const isStaff = user?.role === 'Staff'
  const isCustomer = user?.role === 'Customer'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isStaff, isCustomer }}>
      {children}
    </AuthContext.Provider>
  )
}
