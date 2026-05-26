using API.DTOs;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("[controller]")]
    public class ImagemController(ImagemService imagemService) : ControllerBase
    {
        private readonly ImagemService _imagemService = imagemService;

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> NovaImagem([FromForm] ImagemDto dto)
        {
            if (dto.Arquivo == null || dto.Arquivo.Length == 0)
                return BadRequest(new { message = "Nenhuma imagem enviada." });

            var resultado = await _imagemService.UploadAsync(dto.Arquivo);

            return Ok(resultado);
        }

        [HttpGet]
        public async Task<IActionResult> ObterImagens()
        {
            var imagens = await _imagemService.ListarAsync();

            if (imagens.Count == 0)
                return NotFound(new { message = "Nenhuma imagem encontrada." });

            return Ok(imagens.Select(i => new { i.Id, i.NomeArquivo, i.ContentType, i.CriadoEm, i.Url }));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> ObterImagemPorId(int id)
        {
            var imagem = await _imagemService.ObterPorIdAsync(id);

            if (imagem == null)
                return NotFound(new { message = "Imagem não encontrada." });

            return Ok(imagem);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletarImagem(int id)
        {
            var deletado = await _imagemService.DeletarAsync(id);

            if (!deletado)
                return NotFound(new { message = "Imagem não encontrada." });

            return Ok(new { message = "Imagem deletada com sucesso." });
        }
    }
}
