using API.Data;
using API.DTOs;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography.Xml;

namespace API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("[controller]")]
    public class ImagemController(SupabaseStorageService supabaseStorageService, AppDbContext context) : ControllerBase
    {
        private readonly SupabaseStorageService _supabaseStorageService = supabaseStorageService;
        private readonly AppDbContext _context = context;

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> NovaImagem([FromForm] ImagemDto dto)
        {
            if (dto.Arquivo == null || dto.Arquivo.Length == 0)
                return BadRequest(new { message = "Nenhuma imagem enviada." });

            var caminhoArquivo = await _supabaseStorageService.UploadImagemAsync(dto.Arquivo);

            var imagem = new Imagem
            {
                CaminhoArquivo = caminhoArquivo,
                NomeArquivo = dto.Arquivo.FileName,
                ContentType = dto.Arquivo.ContentType,
                CriadoEm = DateTime.UtcNow
            };

            _context.Imagens.Add(imagem);
            await _context.SaveChangesAsync();

            var signedUrl = await _supabaseStorageService.GerarSignedUrlAsync(imagem.CaminhoArquivo);

            return Ok(new
            {
                imagem.Id,
                imagem.NomeArquivo,
                imagem.ContentType,
                imagem.CriadoEm,
                imagem.CaminhoArquivo,
                Url = signedUrl
            });
        }

        [HttpGet]
        public async Task<IActionResult> ObterImagens()
        {
            var imagens = await _context.Imagens.ToListAsync();

            if (imagens == null || imagens.Count == 0)
                return NotFound(new { message = "Nenhuma imagem encontrada." });

            foreach (var imagem in imagens)
            {
                var signedUrl = await _supabaseStorageService.GerarSignedUrlAsync(imagem.CaminhoArquivo);
                imagem.CaminhoArquivo = signedUrl;
            }

            return Ok(imagens.Select(i => new
            {
                i.Id,
                i.NomeArquivo,
                i.ContentType,
                i.CriadoEm,
                Url = i.CaminhoArquivo
            }));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> ObterImagemPorId(int id)
        {
            var imagem = await _context.Imagens.FirstOrDefaultAsync(i => i.Id == id);

            if (imagem == null)
                return NotFound(new { message = "Imagem não encontrada." });

            var signedUrl = await _supabaseStorageService.GerarSignedUrlAsync(imagem.CaminhoArquivo);

            return Ok(new
            {
                imagem.Id,
                imagem.NomeArquivo,
                imagem.ContentType,
                imagem.CriadoEm,
                imagem.CaminhoArquivo,
                Url = signedUrl
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletarImagem(int id)
        {
            var imagem = await _context.Imagens.FirstOrDefaultAsync(i => i.Id == id);

            if (imagem == null)
                return NotFound(new { message = "Imagem não encontrada." });

            await _supabaseStorageService.DeletarImagemAsync(imagem.CaminhoArquivo);
            _context.Imagens.Remove(imagem);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Imagem deletada com sucesso." });
        }
    }
}