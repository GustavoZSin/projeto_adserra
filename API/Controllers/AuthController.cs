using API.DTOs;
using API.DTOs.Senha;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Web;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Tags("Autenticação")]
    public class AuthController(SignInManager<User> signInManager, UserManager<User> userManager, ProfessorService professorService, IConfiguration configuration, IEmailSender emailSender) : ControllerBase
    {
        private readonly SignInManager<User> _signInManager = signInManager;
        private readonly UserManager<User> _userManager = userManager;
        private readonly ProfessorService _professorService = professorService;
        private readonly IConfiguration _configuration = configuration;
        private readonly IEmailSender _emailSender = emailSender;

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
            var result = await _signInManager.PasswordSignInAsync(user.UserName!, request.Password, isPersistent, lockoutOnFailure: true);

            if (result.RequiresTwoFactor) return Problem(detail: "Requires two-factor authentication.", statusCode: StatusCodes.Status401Unauthorized);
            if (result.IsLockedOut) return Problem(detail: "User account locked out.", statusCode: StatusCodes.Status401Unauthorized);
            if (!result.Succeeded) return Unauthorized();

            return Ok();
        }

        [HttpPost("login-com-matricula")]
        public async Task<IActionResult> LoginComMatricula([FromBody] LoginDto dto)
        {
            //TODO: Ajustar retorno para casos de erro
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

        [HttpPost("esqueci-minha-senha")]
        public async Task<IActionResult> EsqueciMinhaSenha([FromBody] EsqueciMinhaSenhaDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest("E-mail é obrigatório.");

            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user != null)
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);

                var encodedToken = HttpUtility.UrlEncode(token);
                var encodedEmail = HttpUtility.UrlEncode(dto.Email);

                //TODO: ajustar url correta
                //var baseUrl = _configuration["Frontend:BaseUrl"];
                var baseUrl = "http://localhost:5173";
                var resetLink = $"{baseUrl}/resetar-senha?email={encodedEmail}&token={encodedToken}";

                var body = $@"
                <p>Olá,</p>
                <p>Você solicitou a redefinição de senha.</p>
                <p><a href='{resetLink}'>Clique aqui para redefinir sua senha</a></p>
                <p>Se você não solicitou, ignore este e-mail.</p>";

                await _emailSender.SendEmailAsync(dto.Email, "Recuperação de Senha", body);
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

            var decodedToken = HttpUtility.UrlDecode(dto.Token);
            var result = await _userManager.ResetPasswordAsync(user, decodedToken!, dto.NovaSenha);

            if (!result.Succeeded)
                return BadRequest(new { erros = result.Errors.Select(e => e.Description) });

            return Ok(new { mensagem = "Senha redefinida com sucesso." });
        }
    }
}
