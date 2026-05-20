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

export const publicacaoService = {
  listar: (params = {}) =>
    axios.get('/publicacao', { params, withCredentials: true }),

  obter: (id) =>
    axios.get(`/publicacao/${id}`, { withCredentials: true }),

  criar: (formData) =>
    axios.post('/publicacao', formData, { withCredentials: true }),

  editar: (id, formData) =>
    axios.patch(`/publicacao/${id}`, formData, { withCredentials: true }),

  deletar: (id) =>
    axios.delete(`/publicacao/${id}`, { withCredentials: true }),
}

export const usuariosService = {
  listar: () =>
    axios.get('/usuarios', { withCredentials: true }),

  deletar: (id) =>
    axios.delete('/usuarios', { params: { id }, withCredentials: true }),
}

export const solicitacaoIngressoService = {
  listar: (status) =>
    axios.get('/SolicitacaoIngresso/listar-solicitacoes-por-status', {
      params: { status },
      withCredentials: true,
    }),

  aprovar: (id) =>
    axios.post('/SolicitacaoIngresso/aprovar-solicitacao', null, {
      params: { id },
      withCredentials: true,
    }),

  reprovar: (id) =>
    axios.post('/SolicitacaoIngresso/reprovar-solicitacao', null, {
      params: { id },
      withCredentials: true,
    }),
}

export const perfilService = {
  obter: () =>
    axios.get('/perfil', { withCredentials: true }),

  atualizar: (dados) =>
    axios.patch('/perfil', dados, { withCredentials: true }),

  alterarSenha: (dados) =>
    axios.patch('/perfil/senha', dados, { withCredentials: true }),
}

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
