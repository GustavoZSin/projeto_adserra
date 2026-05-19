import { createContext, useContext, useState } from 'react'

const NotificacoesContext = createContext(null)

export function NotificacoesProvider({ children }) {
  const [notificacoes, setNotificacoes] = useState(0)

  return (
    <NotificacoesContext.Provider value={{ notificacoes, setNotificacoes }}>
      {children}
    </NotificacoesContext.Provider>
  )
}

export function useNotificacoes() {
  return useContext(NotificacoesContext)
}
