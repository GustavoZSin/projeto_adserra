import { createContext, useContext, useState } from 'react'

const AprovacoesPendentesContext = createContext(null)

export function AprovacoesPendentesProvider({ children }) {
  const [pendentes, setPendentes] = useState(3) // TODO: inicializar via API ao substituir os mocks
  return (
    <AprovacoesPendentesContext.Provider value={{ pendentes, setPendentes }}>
      {children}
    </AprovacoesPendentesContext.Provider>
  )
}

export function useAprovacoesPendentes() {
  return useContext(AprovacoesPendentesContext)
}
