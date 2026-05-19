import { createContext, useContext, useState, useEffect } from 'react'
import { solicitacaoIngressoService } from '../services/api'

const AprovacoesPendentesContext = createContext(null)

export function AprovacoesPendentesProvider({ children }) {
  const [pendentes, setPendentes] = useState(0)

  useEffect(() => {
    const buscar = () => {
      solicitacaoIngressoService.listar('Pendente')
        .then(r => setPendentes(Array.isArray(r.data) ? r.data.length : 0))
        .catch(() => {})
    }
    buscar()
    const intervalo = setInterval(buscar, 60_000)
    return () => clearInterval(intervalo)
  }, [])

  return (
    <AprovacoesPendentesContext.Provider value={{ pendentes, setPendentes }}>
      {children}
    </AprovacoesPendentesContext.Provider>
  )
}

export function useAprovacoesPendentes() {
  return useContext(AprovacoesPendentesContext)
}
