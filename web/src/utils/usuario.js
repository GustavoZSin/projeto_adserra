export function getIniciais(user) {
  const nome = user?.nomeCompleto || user?.name
  if (nome)
    return nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
  if (user?.matricula) return user.matricula.slice(0, 2).toUpperCase()
  return 'P'
}
