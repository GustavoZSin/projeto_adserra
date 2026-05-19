using API.Data;
using API.DTOs;
using API.DTOs.Response;
using API.DTOs.Senha;
using API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class PerfilService(AppDbContext context, UserManager<User> userManager)
    {
        private readonly AppDbContext _context = context;
        private readonly UserManager<User> _userManager = userManager;

        public async Task<PerfilResponse?> ObterPerfilAsync(string idUsuario)
        {
            var professor = await _context.Professores.FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

            if (professor != null)
            {
                return new PerfilResponse
                {
                    Id = professor.Id,
                    NomeCompleto = professor.NomeCompleto,
                    Matricula = professor.Matricula,
                    EmailInstitucional = professor.EmailInstitucional,
                    Departamento = professor.Departamento,
                    DataCriacao = professor.DataCriacao
                };
            }

            var user = await _userManager.FindByIdAsync(idUsuario);

            if (user == null)
                return null;

            return new PerfilResponse
            {
                Id = 0,
                NomeCompleto = user.UserName ?? string.Empty,
                Matricula = null,
                EmailInstitucional = user.Email ?? string.Empty,
                Departamento = null,
                DataCriacao = DateTime.MinValue
            };
        }

        public async Task<(bool Sucesso, string Mensagem)> EditarPerfilAsync(string idUsuario, EditarPerfilDto dto)
        {
            var professor = await _context.Professores
                .FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

            if (professor != null)
            {
                professor.NomeCompleto = dto.NomeCompleto;
                professor.EmailInstitucional = dto.EmailInstitucional;

                if (dto.Departamento != null)
                    professor.Departamento = dto.Departamento;

                await _context.SaveChangesAsync();
                return (true, "Perfil atualizado com sucesso.");
            }

            var user = await _userManager.FindByIdAsync(idUsuario);

            if (user == null)
                return (false, "Usuário não encontrado.");

            user.UserName = dto.NomeCompleto;
            user.NormalizedUserName = dto.NomeCompleto.ToUpperInvariant();

            var emailResult = await _userManager.SetEmailAsync(user, dto.EmailInstitucional);
            if (!emailResult.Succeeded)
                return (false, string.Join("; ", emailResult.Errors.Select(e => e.Description)));

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return (false, string.Join("; ", updateResult.Errors.Select(e => e.Description)));

            return (true, "Perfil atualizado com sucesso.");
        }

        public async Task<(bool Sucesso, string Mensagem)> AlterarSenhaAsync(string idUsuario, AlterarSenhaDto dto)
        {
            if (dto.NovaSenha != dto.ConfirmarNovaSenha)
                return (false, "A nova senha e a confirmação não coincidem.");

            var user = await _userManager.FindByIdAsync(idUsuario);

            if (user == null)
                return (false, "Usuário não encontrado.");

            var result = await _userManager.ChangePasswordAsync(user, dto.SenhaAtual, dto.NovaSenha);

            if (!result.Succeeded)
                return (false, string.Join("; ", result.Errors.Select(e => e.Description)));

            return (true, "Senha alterada com sucesso.");
        }
    }
}