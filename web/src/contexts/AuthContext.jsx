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

  const login = async (identifier, senha) => {
    setError(null)
    try {
      if (identifier.includes('@')) {
        await authService.loginComEmail(identifier, senha)
      } else {
        await authService.loginComMatricula(identifier, senha)
      }
      await checkAuth()
      return { success: true }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        'Credenciais inválidas.'
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

  // TODO: remover após testes — forçando admin para visualizar páginas de admin
  const isAdmin = true // user?.admin === true

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
