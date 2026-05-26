using API.Data;
using API.DTOs.Response;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class ImagemService(AppDbContext context, SupabaseStorageService storageService)
    {
        private readonly AppDbContext _context = context;
        private readonly SupabaseStorageService _storageService = storageService;

        public async Task<ImagemResponse> UploadAsync(IFormFile arquivo)
        {
            var caminho = await _storageService.UploadImagemAsync(arquivo);

            var imagem = new Imagem
            {
                CaminhoArquivo = caminho,
                NomeArquivo = arquivo.FileName,
                ContentType = arquivo.ContentType,
                CriadoEm = DateTime.UtcNow
            };

            _context.Imagens.Add(imagem);
            await _context.SaveChangesAsync();

            var url = await _storageService.GerarSignedUrlAsync(caminho);

            return new ImagemResponse(imagem.Id, imagem.NomeArquivo, imagem.ContentType, imagem.CriadoEm, imagem.CaminhoArquivo, url);
        }

        public async Task<List<ImagemResponse>> ListarAsync()
        {
            var imagens = await _context.Imagens
                .AsNoTracking()
                .ToListAsync();

            if (imagens.Count == 0)
                return [];

            var signTasks = imagens
                .Select(i => (imagem: i, task: _storageService.GerarSignedUrlAsync(i.CaminhoArquivo)))
                .ToList();

            await Task.WhenAll(signTasks.Select(x => x.task));

            return signTasks
                .Select(x => new ImagemResponse(
                    x.imagem.Id,
                    x.imagem.NomeArquivo,
                    x.imagem.ContentType,
                    x.imagem.CriadoEm,
                    x.imagem.CaminhoArquivo,
                    x.task.Result))
                .ToList();
        }

        public async Task<ImagemResponse?> ObterPorIdAsync(int id)
        {
            var imagem = await _context.Imagens
                .AsNoTracking()
                .FirstOrDefaultAsync(i => i.Id == id);

            if (imagem == null)
                return null;

            var url = await _storageService.GerarSignedUrlAsync(imagem.CaminhoArquivo);

            return new ImagemResponse(imagem.Id, imagem.NomeArquivo, imagem.ContentType, imagem.CriadoEm, imagem.CaminhoArquivo, url);
        }

        public async Task<bool> DeletarAsync(int id)
        {
            var imagem = await _context.Imagens.FirstOrDefaultAsync(i => i.Id == id);

            if (imagem == null)
                return false;

            await _storageService.DeletarImagemAsync(imagem.CaminhoArquivo);
            _context.Imagens.Remove(imagem);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
