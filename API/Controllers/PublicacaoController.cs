using API.DTOs;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class PublicacaoController(PublicacaoService publicacaoService, UserManager<User> userManager) : ControllerBase
    {
        [Authorize(Roles = "Admin")]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> NovaPublicacao([FromForm] PublicacaoDto dto)
        {
            Imagem? imagem = null;

            if (dto.ImagemCapa != null)
            {
                using var memoryStream = new MemoryStream();

                await dto.ImagemCapa.CopyToAsync(memoryStream);

                imagem = new Imagem
                {
                    Conteudo = memoryStream.ToArray(),
                    ContentType = dto.ImagemCapa.ContentType,
                    NomeArquivo = dto.ImagemCapa.FileName,
                    CriadoEm = DateTime.UtcNow
                };
            }

            var publicacao = new Publicacao
            {
                Tipo = dto.Tipo,
                Titulo = dto.Titulo,
                Descricao = dto.Descricao,
                Data = DateTime.SpecifyKind(dto.Data, DateTimeKind.Unspecified),
                Local = dto.Local,
                ImagemCapa = imagem,
                PublicadoEm = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var publicadoPor = await userManager.FindByIdAsync(userId);
            if (publicadoPor == null)
                return Unauthorized();

            publicacao.PublicadoPor = publicadoPor;
            publicacao.PublicadoEm = DateTime.UtcNow;

            var result = await publicacaoService.NovaPublicacao(publicacao);

            if (!result)
                return BadRequest(new { message = "Falha ao criar a publicação. Tente novamente mais tarde." });

            return Ok(new
            {
                message = "Nova publicação criada com sucesso."
            });
        }

        [HttpGet]
        public async Task<IActionResult> ListarPublicacoes([FromQuery] FiltroPublicacaoDto filtro)
        {
            var publicacoes = await publicacaoService.ListarPublicacoesAsync(filtro);
            return Ok(publicacoes);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> ObterPublicacaoPorId(int id)
        {
            var publicacao = await publicacaoService.ObterPublicacaoPorIdAsync(id);

            if (publicacao == null)
                return NotFound(new
                {
                    message = "Publicação não encontrada."
                });

            return Ok(publicacao);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletarPublicacao(int id)
        {
            var result = await publicacaoService.DeletarPublicacaoAsync(id);

            if (!result)
                return NotFound(new
                {
                    message = "Publicação não encontrada."
                });

            return Ok(new
            {
                message = "Publicação deletada com sucesso."
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id:int}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> EditarPublicacao(int id, [FromForm] EditarPublicacaoDto dto)
        {
            Imagem? imagem = null;

            if (dto.ImagemCapa != null)
            {
                using var memoryStream = new MemoryStream();

                await dto.ImagemCapa.CopyToAsync(memoryStream);

                imagem = new Imagem
                {
                    Conteudo = memoryStream.ToArray(),
                    ContentType = dto.ImagemCapa.ContentType,
                    NomeArquivo = dto.ImagemCapa.FileName,

                    CriadoEm = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
                };
            }

            var result = await publicacaoService.EditarPublicacaoAsync(id, dto, imagem);

            if (!result)
            {
                return NotFound(new
                {
                    message = "Publicação não encontrada."
                });
            }

            return Ok(new
            {
                message = "Publicação atualizada com sucesso."
            });
        }
    }
}
