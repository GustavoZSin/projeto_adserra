using API.Data;
using API.Models;
using API.Models.Enums;
using API.Services.Email;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;

namespace API.Services
{
    public class SolicitacaoIngressoService(AppDbContext context, EmailService emailService, ProfessorService professorService, UserManager<User> userManager)
    {
        private readonly UserManager<User> _userManager = userManager;
        private readonly EmailService _emailService = emailService;
        private readonly AppDbContext _context = context;
        private readonly ProfessorService _professorService = professorService;

        internal async Task<bool> AprovarSolicitacao(int id)
        {
            var solicitacao = await _context.SolicitacoesIngresso.FindAsync(id);

            if (solicitacao == null || solicitacao.StatusSolicitacao != EnumeradorDeStatus.Pendente)
                return false;
            
            var identityUser = await _userManager.FindByEmailAsync(solicitacao.EmailInstitucional);
            if (identityUser == null)
            {
                identityUser = new User
                {
                    UserName = solicitacao.EmailInstitucional,
                    Email = solicitacao.EmailInstitucional
                };
                var senhaProvisoria = GerarSenhaProvisoria();
                var result = await _userManager.CreateAsync(identityUser, senhaProvisoria);

                if (!result.Succeeded) return false;
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

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(identityUser);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var link = $"https://localhost:7192/Auth/confirmEmail?userId={identityUser.Id}&code={encodedToken}";
            await _emailService.EnviarConfirmacao(identityUser.Email, link);

            solicitacao.StatusSolicitacao = EnumeradorDeStatus.Aprovado;
            await _context.SaveChangesAsync();

            return true;
        }
        private string GerarSenhaProvisoria() => "Temp@123";
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
