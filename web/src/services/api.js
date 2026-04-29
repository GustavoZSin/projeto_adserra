import axios from 'axios'

const api = axios.create({
  baseURL: '/auth',
  withCredentials: true, // enviar cookie de autenticação
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login se não autenticado
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  /**
   * Login com matrícula e senha
   * POST /auth/login-com-matricula
   */
  login: (matricula, senha) =>
    api.post('/login-com-matricula', { matricula, senha }),

  /**
   * Logout
   * POST /auth/logout
   */
  logout: () => api.post('/logout'),

  /**
   * Obter usuário autenticado
   * GET /auth/me
   */
  me: () => api.get('/me'),

  /**
   * Solicitar ingresso
   * POST /SolicitacaoIngresso
   */
  solicitarIngresso: (dados) =>
    axios.post('/SolicitacaoIngresso', dados, { withCredentials: true }),
}

export default api
