using API.DTOs.ListagemPublicacoes;
using API.DTOs.Publicacoes;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class PublicacaoController(PublicacaoService publicacaoService, UserManager<User> userManager, NotificacaoService notificacaoService) : ControllerBase
    {
        [Authorize(Roles = "Admin")]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> NovaPublicacao([FromForm] PublicacaoDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var publicadoPor = await userManager.FindByIdAsync(userId);
            if (publicadoPor == null)
                return Unauthorized();

            var result = await publicacaoService.NovaPublicacao(dto, publicadoPor, userId);

            if (!result)
                return BadRequest(new { message = "Falha ao criar a publicação. Tente novamente mais tarde." });

            return Ok(new { message = "Nova publicação criada com sucesso." });
        }

        [HttpGet]
        public async Task<IActionResult> ListarPublicacoes([FromQuery] FiltroPublicacaoUsuarioAutenticadoDto filtro)
        {
            var publicacoes = await publicacaoService.ListarPublicacoesAsync(filtro);
            return Ok(publicacoes);
        }

        [AllowAnonymous]
        [HttpGet("ListarPublicas")]
        public async Task<IActionResult> ListarPublicacoesPublicas([FromQuery] FiltroPublicacaoDto filtro)
        {
            var publicacoes = await publicacaoService.ListarPublicacoesPublicasAsync(filtro);
            return Ok(publicacoes);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> ObterPublicacaoPorId(int id)
        {
            var publicacao = await publicacaoService.ObterPublicacaoPorIdAsync(id);

            if (publicacao == null)
                return NotFound(new { message = "Publicação não encontrada." });

            return Ok(publicacao);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletarPublicacao(int id)
        {
            var result = await publicacaoService.DeletarPublicacaoAsync(id);

            if (!result)
                return NotFound(new { message = "Publicação não encontrada." });

            return Ok(new { message = "Publicação deletada com sucesso." });
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id:int}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> EditarPublicacao(int id, [FromForm] EditarPublicacaoDto dto)
        {
            Imagem? imagemCapa = null;

            if (dto.ImagemCapa != null)
            {
                var caminhoArquivo = await publicacaoService.UploadImagemAsync(dto.ImagemCapa);

                imagemCapa = new Imagem
                {
                    CaminhoArquivo = caminhoArquivo,
                    ContentType = dto.ImagemCapa.ContentType,
                    NomeArquivo = dto.ImagemCapa.FileName,
                    CriadoEm = DateTime.UtcNow
                };
            }

            List<PublicacaoImagem> imagensGaleria = [];
            if (dto.ImagensParaGaleria != null && dto.ImagensParaGaleria.Count != 0)
            {
                var uploadTasks = dto.ImagensParaGaleria
                    .Select(async (arquivo, idx) =>
                    {
                        var caminho = await publicacaoService.UploadImagemAsync(arquivo);
                        return (caminho, arquivo, ordem: idx);
                    });

                var resultados = await Task.WhenAll(uploadTasks);

                imagensGaleria = [.. resultados
                    .OrderBy(r => r.ordem)
                    .Select(r => new PublicacaoImagem
                    {
                        Imagem = new Imagem
                        {
                            CaminhoArquivo = r.caminho,
                            ContentType = r.arquivo.ContentType,
                            NomeArquivo = r.arquivo.FileName,
                            CriadoEm = DateTime.UtcNow
                        },
                        Ordem = r.ordem
                    })];
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var (result, publicacaoPublicada) = await publicacaoService.EditarPublicacaoAsync(id, dto, imagemCapa, imagensGaleria);

            if (!result)
                return NotFound(new { message = "Publicação não encontrada." });

            if (publicacaoPublicada != null)
                await notificacaoService.CriarNotificacoesParaPublicacaoAsync(publicacaoPublicada, userId);

            return Ok(new { message = "Publicação atualizada com sucesso." });
        }
    }
}
