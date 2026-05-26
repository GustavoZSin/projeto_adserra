using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("[controller]")]
    public class UsuariosController(UsuariosService usuariosService, ILogger<UsuariosController> logger) : ControllerBase
    {
        private readonly UsuariosService _usuariosService = usuariosService;
        private readonly ILogger<UsuariosController> _logger = logger;

        [HttpGet]
        public async Task<IActionResult> Usuarios()
        {
            var usuarios = await _usuariosService.ListarUsuariosAsync();
            return Ok(usuarios);
        }

        [HttpDelete]
        public async Task<IActionResult> DeletarUsuario([FromQuery] int id)
        {
            try
            {
                var deletado = await _usuariosService.DeletarUsuarioAsync(id);

                if (!deletado)
                    return NotFound(new { message = "Usuário não encontrado" });

                return Ok(new { message = "Usuário deletado com sucesso" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao deletar usuário {Id}", id);
                return StatusCode(500, new { message = "Ocorreu um erro ao deletar o usuário." });
            }
        }
    }
}
