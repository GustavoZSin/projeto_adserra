using API.DTOs;
using API.DTOs.Senha;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    [Tags("Perfil")]
    public class PerfilController(PerfilService perfilService) : ControllerBase
    {
        private readonly PerfilService _perfilService = perfilService;

        [HttpGet]
        public async Task<IActionResult> ObterPerfil()
        {
            var idUsuario = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (idUsuario == null)
                return Unauthorized();

            var perfil = await _perfilService.ObterPerfilAsync(idUsuario);

            if (perfil == null)
                return NotFound(new { message = "Perfil não encontrado." });

            return Ok(perfil);
        }

        [HttpPatch]
        public async Task<IActionResult> EditarPerfil([FromBody] EditarPerfilDto dto)
        {
            var idUsuario = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (idUsuario == null)
                return Unauthorized();

            var (sucesso, mensagem) = await _perfilService.EditarPerfilAsync(idUsuario, dto);

            if (!sucesso)
                return BadRequest(new { message = mensagem });

            return Ok(new { message = mensagem });
        }

        [HttpPatch("senha")]
        public async Task<IActionResult> AlterarSenha([FromBody] AlterarSenhaDto dto)
        {
            var idUsuario = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (idUsuario == null)
                return Unauthorized();

            var (sucesso, mensagem) = await _perfilService.AlterarSenhaAsync(idUsuario, dto);

            if (!sucesso)
                return BadRequest(new { message = mensagem });

            return Ok(new { message = mensagem });
        }
    }
}