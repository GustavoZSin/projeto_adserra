using API.Data;
using API.DTOs;
using API.DTOs.Response;
using API.Models;
using API.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class PublicacaoService(AppDbContext context, SupabaseStorageService storageService)
    {
        private readonly AppDbContext _context = context;
        private readonly SupabaseStorageService _storageService = storageService;

        internal async Task<bool> NovaPublicacao(Publicacao publicacao)
        {
            if (publicacao == null)
                return false;

            publicacao.PublicadoEm = DateTime.SpecifyKind(publicacao.PublicadoEm, DateTimeKind.Unspecified);
            publicacao.Data = DateTime.SpecifyKind(publicacao.Data, DateTimeKind.Unspecified);

            _context.Publicacoes.Add(publicacao);
            await _context.SaveChangesAsync();
            return true;
        }
        internal async Task<List<PublicacaoResponse>> ListarPublicacoesAsync(FiltroPublicacaoDto filtro)
        {
            var query = _context.Publicacoes
                .Include(p => p.ImagemCapa)
                .Include(p => p.PublicadoPor)
                .Include(p => p.Imagens).ThenInclude(pi => pi.Imagem)
                .AsQueryable();

            if (filtro.Tipo.HasValue)
                query = query.Where(p => p.Tipo == filtro.Tipo.Value);

            var hoje = DateTime.SpecifyKind(
                DateTime.Now,
                DateTimeKind.Unspecified
            );

            if (filtro.StatusTemporal.HasValue)
            {
                switch (filtro.StatusTemporal.Value)
                {
                    case EnumeradorDeStatusPublicacaoTemporal.Futuras:
                        query = query.Where(p => p.Data >= hoje);
                        break;

                    case EnumeradorDeStatusPublicacaoTemporal.Passadas:
                        query = query.Where(p => p.Data < hoje);
                        break;
                }
            }

            if (filtro.DataInicio.HasValue)
            {
                var dataInicio = DateTime.SpecifyKind(
                    filtro.DataInicio.Value,
                    DateTimeKind.Unspecified
                );

                query = query.Where(p => p.Data >= dataInicio);
            }

            if (filtro.DataFim.HasValue)
            {
                var dataFim = DateTime.SpecifyKind(
                    filtro.DataFim.Value,
                    DateTimeKind.Unspecified
                );

                query = query.Where(p => p.Data <= dataFim);
            }

            if (filtro.Publicas.HasValue)
                query = query.Where(p => p.Publica == filtro.Publicas.Value);

            var entidades = await query.ToListAsync();

            var publicacoes = new List<PublicacaoResponse>();

            foreach (var p in entidades)
            {
                string? imagemUrl = null;

                if (p.ImagemCapa != null)
                    imagemUrl = await _storageService.GerarSignedUrlAsync(p.ImagemCapa.CaminhoArquivo);

                List<ImagemPublicacaoResponse> imagensPublicacao = [];
                foreach (var ip in p.Imagens.Where(ip => ip.Imagem != null))
                {
                    var ipUrl = await _storageService.GerarSignedUrlAsync(ip.Imagem.CaminhoArquivo);
                    imagensPublicacao.Add(new ImagemPublicacaoResponse
                    {
                        URL = ipUrl,
                        Id = ip.Imagem.Id
                    });
                }

                publicacoes.Add(new PublicacaoResponse
                {
                    Id = p.Id,
                    Tipo = p.Tipo.ToString(),
                    Titulo = p.Titulo,
                    Descricao = p.Descricao,
                    Data = p.Data,
                    Local = p.Local,
                    PublicadoEm = p.PublicadoEm,
                    NomePublicadoPor = p.PublicadoPor.UserName!,
                    ImagemCapaUrl = imagemUrl,
                    Publica = p.Publica,
                    ImagensPublicacao = imagensPublicacao.Count > 0 ? imagensPublicacao : null
                });
            }

            return publicacoes;
        }
        internal async Task<PublicacaoResponse?> ObterPublicacaoPorIdAsync(int id)
        {
            var p = await _context.Publicacoes
                .Include(x => x.PublicadoPor)
                .Include(x => x.ImagemCapa)
                .Include(x => x.Imagens).ThenInclude(pi => pi.Imagem)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (p == null)
                return null;

            string? imagemUrl = null;

            if (p.ImagemCapa != null)
                imagemUrl = await _storageService.GerarSignedUrlAsync(p.ImagemCapa.CaminhoArquivo);

            List<ImagemPublicacaoResponse> imagensPublicacao = [];
            foreach (var ip in p.Imagens.Where(ip => ip.Imagem != null))
            {
                var ipUrl = await _storageService.GerarSignedUrlAsync(ip.Imagem.CaminhoArquivo);
                imagensPublicacao.Add(new ImagemPublicacaoResponse
                {
                    URL = ipUrl,
                    Id = ip.Imagem.Id
                });
            }

            return new PublicacaoResponse
            {
                Id = p.Id,
                Tipo = p.Tipo.ToString(),
                Titulo = p.Titulo,
                Descricao = p.Descricao,
                Data = p.Data,
                Local = p.Local,
                PublicadoEm = p.PublicadoEm,
                NomePublicadoPor = p.PublicadoPor.UserName!,
                ImagemCapaUrl = imagemUrl,
                Publica = p.Publica,
                ImagensPublicacao = imagensPublicacao.Count > 0 ? imagensPublicacao : null
            };
        }
        internal async Task<bool> DeletarPublicacaoAsync(int id)
        {
            var publicacao = await _context.Publicacoes
                .Include(p => p.ImagemCapa)
                .Include(x => x.Imagens).ThenInclude(pi => pi.Imagem)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (publicacao == null)
                return false;

            foreach (var item in publicacao.Imagens)
            {
                await _storageService.DeletarImagemAsync(item.Imagem.CaminhoArquivo);
                _context.Imagens.Remove(item.Imagem);
            }

            if (publicacao.ImagemCapa != null)
            {
                await _storageService.DeletarImagemAsync(publicacao.ImagemCapa.CaminhoArquivo);
                _context.Imagens.Remove(publicacao.ImagemCapa);
            }

            _context.Publicacoes.Remove(publicacao);

            await _context.SaveChangesAsync();

            return true;
        }
        internal async Task<bool> EditarPublicacaoAsync(int id, EditarPublicacaoDto dto, Imagem? imagemCapa, List<PublicacaoImagem> imagensGaleria)
        {
            var publicacao = await _context.Publicacoes
                .Include(p => p.ImagemCapa)
                .Include(p => p.Imagens).ThenInclude(pi => pi.Imagem)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (publicacao == null)
                return false;

            if (dto.Tipo.HasValue)
                publicacao.Tipo = dto.Tipo.Value;

            if (!string.IsNullOrWhiteSpace(dto.Titulo))
                publicacao.Titulo = dto.Titulo;

            if (!string.IsNullOrWhiteSpace(dto.Descricao))
                publicacao.Descricao = dto.Descricao;

            if (dto.Data != default)
                publicacao.Data = DateTime.SpecifyKind(dto.Data.Value, DateTimeKind.Unspecified);

            if (!string.IsNullOrWhiteSpace(dto.Local))
                publicacao.Local = dto.Local;

            if (imagemCapa != null)
            {
                if (publicacao.ImagemCapa != null)
                {
                    await _storageService.DeletarImagemAsync(publicacao.ImagemCapa.CaminhoArquivo);
                    _context.Imagens.Remove(publicacao.ImagemCapa);
                }

                publicacao.ImagemCapa = imagemCapa;
            }

            if (dto.Publica.HasValue)
                publicacao.Publica = dto.Publica.Value;

            if (imagensGaleria != null && imagensGaleria.Count != 0)
            {
                foreach (var item in publicacao.Imagens)
                {
                    await _storageService.DeletarImagemAsync(item.Imagem.CaminhoArquivo);
                    _context.Imagens.Remove(item.Imagem);
                }

                publicacao.Imagens.Clear();

                foreach (var imagem in imagensGaleria)
                    publicacao.Imagens.Add(imagem);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        internal async Task<string> UploadImagemAsync(IFormFile arquivo)
        {
            return await _storageService.UploadImagemAsync(arquivo);
        }
    }
}
