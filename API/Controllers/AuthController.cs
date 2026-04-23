using API.DTOs;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Tags("Autenticação")]
    public class AuthController : ControllerBase
    {
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly ProfessorService _professorService;

        public AuthController(SignInManager<User> signInManager, UserManager<User> userManager, ProfessorService professorService)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _professorService = professorService;
        }

        [HttpPost("login-com-matricula")]
        public async Task<IActionResult> LoginComMatricula([FromBody] LoginDto dto)
        {
            var professor = await _professorService.ObterPorMatricula(dto.Matricula);
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == professor.IdUsuario);

            if (user == null)
                return Unauthorized("Usuário não encontrado");

            var result = await _signInManager.PasswordSignInAsync(user, dto.Senha, isPersistent: true, lockoutOnFailure: false);

            if (!result.Succeeded)
                return Unauthorized("Credenciais inválidas");

            return Ok(new { message = "Login realizado com sucesso" });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { message = "Logout realizado com sucesso" });
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            if (!User.Identity.IsAuthenticated)
                return Unauthorized();

            return Ok(new
            {
                id = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
                matricula = User.Identity.Name
            });
        }
    }
}
