using API.DTOs;
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

            var imagensParaGaleria = new List<PublicacaoImagem>();
            if (dto.ImagensParaGaleria != null && dto.ImagensParaGaleria.Count != 0)
            {
                int ordem = 0;

                foreach (var arquivo in dto.ImagensParaGaleria)
                {
                    var caminhoArquivo = await publicacaoService.UploadImagemAsync(arquivo);

                    var imagemPublicacao = new Imagem
                    {
                        CaminhoArquivo = caminhoArquivo,
                        ContentType = arquivo.ContentType,
                        NomeArquivo = arquivo.FileName,
                        CriadoEm = DateTime.UtcNow
                    };

                    imagensParaGaleria.Add(new PublicacaoImagem
                    {
                        Imagem = imagemPublicacao,
                        Ordem = ordem++
                    });
                }
            }

            var publicacao = new Publicacao
            {
                Tipo = dto.Tipo,
                Titulo = dto.Titulo,
                Descricao = dto.Descricao,
                Data = DateTime.SpecifyKind(dto.Data, DateTimeKind.Unspecified),
                Local = dto.Local,
                ImagemCapa = imagemCapa,
                Publica = dto.Publica,
                PublicadoEm = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                Imagens = imagensParaGaleria,
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

            await notificacaoService.CriarNotificacoesParaPublicacaoAsync(publicacao, userId);

            return Ok(new { message = "Nova publicação criada com sucesso." });
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

            var imagensGaleria = new List<PublicacaoImagem>();
            if (dto.ImagensParaGaleria != null && dto.ImagensParaGaleria.Count != 0)
            {
                int ordem = 0;

                foreach (var arquivo in dto.ImagensParaGaleria)
                {
                    var caminhoArquivo = await publicacaoService.UploadImagemAsync(arquivo);

                    var imagemGaleria = new Imagem
                    {
                        CaminhoArquivo = caminhoArquivo,
                        ContentType = arquivo.ContentType,
                        NomeArquivo = arquivo.FileName,
                        CriadoEm = DateTime.UtcNow
                    };

                    imagensGaleria.Add(new PublicacaoImagem
                    {
                        Imagem = imagemGaleria,
                        Ordem = ordem++
                    });
                }
            }

            var result = await publicacaoService.EditarPublicacaoAsync(id, dto, imagemCapa, imagensGaleria);

            if (!result)
                return NotFound(new { message = "Publicação não encontrada." });

            return Ok(new { message = "Publicação atualizada com sucesso." });
        }
    }
}