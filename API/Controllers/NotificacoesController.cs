using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    [Tags("Notificações")]
    public class NotificacoesController(NotificacaoService notificacaoService) : ControllerBase
    {
        private readonly NotificacaoService _notificacaoService = notificacaoService;

        [HttpGet]
        public async Task<IActionResult> Listar([FromQuery] string? status)
        {
            var idUsuario = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (idUsuario == null)
                return Unauthorized();

            var notificacoes = await _notificacaoService.ListarAsync(idUsuario, status);
            return Ok(notificacoes);
        }

        [HttpGet("nao-lidas/contagem")]
        public async Task<IActionResult> ContarNaoLidas()
        {
            var idUsuario = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (idUsuario == null)
                return Unauthorized();

            var contagem = await _notificacaoService.ContarNaoLidasAsync(idUsuario);
            return Ok(new { contagem });
        }

        [HttpPatch("{id:int}/ler")]
        public async Task<IActionResult> MarcarComoLida(int id)
        {
            var idUsuario = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (idUsuario == null)
                return Unauthorized();

            var resultado = await _notificacaoService.MarcarComoLidaAsync(idUsuario, id);

            if (!resultado)
                return NotFound(new { message = "Notificação não encontrada." });

            return Ok(new { message = "Notificação marcada como lida." });
        }

        [HttpPatch("ler-todas")]
        public async Task<IActionResult> MarcarTodasComoLidas()
        {
            var idUsuario = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (idUsuario == null)
                return Unauthorized();

            await _notificacaoService.MarcarTodasComoLidasAsync(idUsuario);
            return Ok(new { message = "Todas as notificações foram marcadas como lidas." });
        }
    }
}