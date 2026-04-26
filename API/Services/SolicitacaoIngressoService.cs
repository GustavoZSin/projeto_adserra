using API.Data;
using API.Models;
using API.Models.Enums;

namespace API.Services
{
    public class SolicitacaoIngressoService
    {
        private readonly AppDbContext _context;
        private readonly ProfessorService _professorService;

        public SolicitacaoIngressoService(AppDbContext context, ProfessorService professorService)
        {
            _context = context;
            _professorService = professorService;
        }

        internal async Task<bool> AprovarSolicitacao(int id)
        {
            var solicitacao = await _context.SolicitacoesIngresso.FindAsync(id);

            if (solicitacao == null || solicitacao.StatusSolicitacao != EnumeradorDeStatus.Pendente)
                return false;

            var identityUser = _context.Users.FirstOrDefault(u => u.Email == solicitacao.EmailInstitucional && u.UserName == solicitacao.NomeCompleto);
            if (identityUser == null)
            {
                identityUser = new User
                {
                    UserName = solicitacao.EmailInstitucional,
                    Email = solicitacao.EmailInstitucional,
                };

                var result = await _context.Users.AddAsync(identityUser);

                if (result == null) return false;
            }

            var professorCriado = await _professorService.CriarProfessorAsync(
                solicitacao.NomeCompleto,
                solicitacao.Matricula,
                solicitacao.EmailInstitucional,
                solicitacao.Departamento,
                identityUser.Id,
                identityUser
            );

            if (!professorCriado) return false;

            solicitacao.StatusSolicitacao = EnumeradorDeStatus.Aprovado;
            await _context.SaveChangesAsync();

            return true;
        }

        internal async Task<bool> CriarSolicitacao(SolicitacaoIngresso solicitacao)
        {
            _context.SolicitacoesIngresso.Add(solicitacao);
            await _context.SaveChangesAsync();

            return true;
        }

        internal List<SolicitacaoIngresso> ListarSolicitacoesPorStatus(EnumeradorDeStatus status)
        {
            return _context.SolicitacoesIngresso.Where(s => s.StatusSolicitacao == status).ToList();
        }

        internal async Task<bool> ReprovarSolicitacao(int id)
        {
            var solicitacao = await _context.SolicitacoesIngresso.FindAsync(id);
            if (solicitacao == null)
                return false;

            solicitacao.StatusSolicitacao = EnumeradorDeStatus.Reprovado;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
