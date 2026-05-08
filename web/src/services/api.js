import axios from 'axios'

const api = axios.create({
  baseURL: '/auth',
  withCredentials: true, // enviar cookie de autenticação
  headers: {
    'Content-Type': 'application/json',
  },
})

const PUBLIC_PATHS = ['/login', '/interesse', '/esqueci-senha', '/redefinir-senha', '/confirmar-cadastro']

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublic = PUBLIC_PATHS.some(p => window.location.pathname.startsWith(p))
    if (error.response?.status === 401 && !isPublic) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  loginComMatricula: (matricula, senha) =>
    api.post('/login-com-matricula', { matricula, senha }),

  loginComEmail: (email, senha) =>
    api.post('/login?useCookies=true', { email, password: senha }),

  logout: () => api.post('/logout'),

  me: () => api.get('/me'),

  solicitarIngresso: (dados) =>
    axios.post('/SolicitacaoIngresso/solicitar-ingresso', dados, { withCredentials: true }),
}

export default api
