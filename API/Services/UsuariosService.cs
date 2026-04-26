using API.Data;
using API.DTOs.Response;
using API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class UsuariosService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;

        public UsuariosService(AppDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        internal async Task<List<ListarUsuarioResponse>> ListarUsuariosAsync()
        {
            var response = _context.Professores
            .Select(p => new ListarUsuarioResponse
            {
                Id = p.Id,
                NomeCompleto = p.NomeCompleto,
                Matricula = p.Matricula,
                EmailInstitucional = p.EmailInstitucional,
                Departamento = p.Departamento
            });

            return await response.ToListAsync();
        }

        public async Task<bool> DeletarUsuarioAsync(int id)
        {
            var professor = await _context.Professores
                .Include(p => p.Usuario)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (professor == null)
                return false;

            _context.Professores.Remove(professor);
            await _userManager.DeleteAsync(professor.Usuario);

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
