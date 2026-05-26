using API.Data;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class ProfessorService(AppDbContext context)
    {
        private readonly AppDbContext _context = context;

        internal async Task<bool> CriarProfessorAsync(string nomeCompleto, string matricula, string emailInstitucional, string departamento, string idUserIdentity, User userIdentity, int solicitacaoIngressoId, SolicitacaoIngresso solicitacao)
        {
            var professor = new Professor
            {
                NomeCompleto = nomeCompleto,
                Matricula = matricula,
                EmailInstitucional = emailInstitucional,
                Departamento = departamento,
                IdUsuario = idUserIdentity,
                Usuario = userIdentity,
                SolicitacaoIngressoId = solicitacaoIngressoId,
                SolicitacaoIngresso = solicitacao
            };

            _context.Professores.Add(professor);
            await _context.SaveChangesAsync();

            return true;
        }

        internal async Task<Professor?> ObterPorMatricula(string matricula)
        {
            return await _context.Professores
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Matricula == matricula);
        }

        internal async Task<string?> ObterNomePorIdUsuario(string idUsuario)
        {
            return await _context.Professores
                .AsNoTracking()
                .Where(p => p.IdUsuario == idUsuario)
                .Select(p => p.NomeCompleto)
                .FirstOrDefaultAsync();
        }
    }
}
