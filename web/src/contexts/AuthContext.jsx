import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // Verifica se há sessão ativa ao carregar a aplicação
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await authService.me()
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (matricula, senha) => {
    setError(null)
    try {
      await authService.login(matricula, senha)
      await checkAuth()
      return { success: true }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        'Matrícula ou senha incorretos.'
      setError(typeof msg === 'string' ? msg : 'Erro ao fazer login.')
      return { success: false, error: msg }
    }
  }

  const loginAdmin = async (email, senha) => {
    setError(null)
    try {
      await authService.loginAdmin(email, senha)
      await checkAuth()
      return { success: true }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        'E-mail ou senha incorretos.'
      setError(typeof msg === 'string' ? msg : 'Erro ao fazer login.')
      return { success: false, error: msg }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
    }
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider value={{ user, loading, error, login, loginAdmin, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
