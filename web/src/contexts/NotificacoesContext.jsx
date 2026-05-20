import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { notificacaoService } from '../services/api'
import { useAuth } from './AuthContext'

const NotificacoesContext = createContext(null)

const INTERVALO_MS = 30_000

export function NotificacoesProvider({ children }) {
  const { user } = useAuth()
  const [notificacoes, setNotificacoes] = useState(0)

  const buscar = useCallback(() => {
    if (!user) return
    notificacaoService.contarNaoLidas()
      .then(({ data }) => setNotificacoes(data.contagem ?? 0))
      .catch(() => {})
  }, [user])

  useEffect(() => {
    buscar()
    const intervalo = setInterval(buscar, INTERVALO_MS)
    return () => clearInterval(intervalo)
  }, [buscar])

  return (
    <NotificacoesContext.Provider value={{ notificacoes, recarregar: buscar }}>
      {children}
    </NotificacoesContext.Provider>
  )
}

export function useNotificacoes() {
  return useContext(NotificacoesContext)
}
