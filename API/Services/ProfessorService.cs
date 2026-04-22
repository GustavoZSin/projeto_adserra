using API.Data;
using API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class ProfessorService
    {
        private readonly AppDbContext _context;
        public ProfessorService(AppDbContext context)
        {
            _context = context;
        }

        internal async Task<bool> CriarProfessorAsync(string nomeCompleto, string matricula, string emailInstitucional, string departamento, string idUserIdentity, User userIdentity)
        {
            var professor = new Professor
            {
                NomeCompleto = nomeCompleto,
                Matricula = matricula,
                EmailInstitucional = emailInstitucional,
                Departamento = departamento,
                IdUsuario = idUserIdentity,
                Usuario = userIdentity
            };

            _context.Professores.Add(professor);
            await _context.SaveChangesAsync();

            return true;
        }

        internal async Task<Professor> ObterPorMatricula(string matricula)
        {
            return await _context.Professores.FirstOrDefaultAsync(p => p.Matricula == matricula);
        }
    }
}
