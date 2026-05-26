using API.DTOs;
using API.DTOs.Senha;
using API.Models;
using API.Services;
using API.Services.Email;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using System.Security.Claims;
using System.Text;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Tags("Autenticação")]
    public class AuthController(
        SignInManager<User> signInManager,
        UserManager<User> userManager,
        ProfessorService professorService,
        IConfiguration configuration,
        EmailService emailService) : ControllerBase
    {
        private readonly SignInManager<User> _signInManager = signInManager;
        private readonly UserManager<User> _userManager = userManager;
        private readonly ProfessorService _professorService = professorService;
        private readonly IConfiguration _configuration = configuration;
        private readonly EmailService _emailService = emailService;

        [HttpPost("registrar-admin")]
        public async Task<IActionResult> RegistrarAdmin([FromBody] RegistrarAdminDto dto)
        {
            var usuarioExistente = await _userManager.FindByEmailAsync(dto.Email);

            if (usuarioExistente != null)
                return BadRequest("Usuário já existe no sistema");

            var novoUsuario = new User
            {
                Email = dto.Email,
                UserName = dto.NomeCompleto
            };

            var result = await _userManager.CreateAsync(novoUsuario, dto.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            var roleResult = await _userManager.AddToRoleAsync(novoUsuario, "Admin");
            if (!roleResult.Succeeded)
                return BadRequest(roleResult.Errors);

            return Ok(new { message = "Usuário admin criado com sucesso" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request, [FromQuery] bool? useCookies, [FromQuery] bool? useSessionCookies)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null) return Unauthorized();

            var isPersistent = useCookies == true && useSessionCookies != true;
            var result = await _signInManager.PasswordSignInAsync(user, request.Password, isPersistent, lockoutOnFailure: true);

            if (result.RequiresTwoFactor) return Problem(detail: "Requires two-factor authentication.", statusCode: StatusCodes.Status401Unauthorized);
            if (result.IsLockedOut) return Problem(detail: "User account locked out.", statusCode: StatusCodes.Status401Unauthorized);
            if (!result.Succeeded) return Unauthorized();

            return Ok();
        }

        [HttpPost("login-com-matricula")]
        public async Task<IActionResult> LoginComMatricula([FromBody] LoginDto dto)
        {
            var professor = await _professorService.ObterPorMatricula(dto.Matricula);

            if (professor == null)
                return Unauthorized("Usuário não encontrado");

            var user = await _userManager.FindByIdAsync(professor.IdUsuario);

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
        public async Task<IActionResult> Me()
        {
            if (!User.Identity!.IsAuthenticated)
                return Unauthorized();

            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var nomeCompleto = id != null ? await _professorService.ObterNomePorIdUsuario(id) : null;

            return Ok(new
            {
                id,
                matricula = User.Identity.Name,
                admin = User.IsInRole("Admin"),
                nomeCompleto,
            });
        }

        [HttpPost("esqueci-minha-senha")]
        public async Task<IActionResult> EsqueciMinhaSenha([FromBody] EsqueciMinhaSenhaDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest("E-mail é obrigatório.");

            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user != null)
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
                var encodedEmail = Uri.EscapeDataString(dto.Email);

                var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
                var resetLink = $"{frontendUrl}/redefinir-senha?email={encodedEmail}&token={encodedToken}";

                await _emailService.EnviarResetSenha(dto.Email, resetLink);
            }

            return Ok(new { mensagem = "Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha." });
        }

        [HttpPost("resetar-senha")]
        public async Task<IActionResult> ResetarSenha([FromBody] ResetarSenhaDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.NovaSenha))
                return BadRequest("Dados inválidos.");

            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user == null)
                return BadRequest("Token inválido ou expirado.");

            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(dto.Token));
            var result = await _userManager.ResetPasswordAsync(user, decodedToken, dto.NovaSenha);

            if (!result.Succeeded)
                return BadRequest(new { erros = result.Errors.Select(e => e.Description) });

            return Ok(new { mensagem = "Senha redefinida com sucesso." });
        }
    }
}
