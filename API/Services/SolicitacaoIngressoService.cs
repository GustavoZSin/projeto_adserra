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
            if (solicitacao == null)
                return false;

            var identityUser = new User
            {
                UserName = solicitacao.EmailInstitucional,
                Email = solicitacao.EmailInstitucional,
            };
            _context.Users.Add(identityUser);
            _context.SaveChanges();

            var professorCriado = await _professorService.CriarProfessorAsync(solicitacao.NomeCompleto, solicitacao.Matricula, solicitacao.EmailInstitucional, solicitacao.Departamento, identityUser.Id, identityUser);

            if (!professorCriado)
                return false;

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

        internal List<SolicitacaoIngresso> ListarSolicitacoesPendentes()
        {
            return _context.SolicitacoesIngresso.Where(s => s.StatusSolicitacao == EnumeradorDeStatus.Pendente).ToList();
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
