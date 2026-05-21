using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("[controller]")]
    public class UsuariosController(UsuariosService usuariosService) : ControllerBase
    {
        private readonly UsuariosService _usuariosService = usuariosService;

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
                var result = await _usuariosService.DeletarUsuarioAsync(id);

                if (!result)
                    return NotFound(new { message = "Usuário não encontrado" });

                return Ok(new { message = "Usuário deletado com sucesso" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Ocorreu um erro ao deletar o usuário." });
            }
        }
    }
}
