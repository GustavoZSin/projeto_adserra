using API.Data;
using API.DTOs;
using API.DTOs.Response;
using API.Models;
using API.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class PublicacaoService(AppDbContext context)
    {
        private readonly AppDbContext _context = context;
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

            var publicacoes = query
            .Select(p => new PublicacaoResponse
            {
                Id = p.Id,
                Tipo = p.Tipo.ToString(),
                Titulo = p.Titulo,
                Descricao = p.Descricao,
                Data = p.Data,
                Local = p.Local,
                PublicadoEm = p.PublicadoEm,
                NomePublicadoPor = p.PublicadoPor.UserName,
                ImagemCapaBase64 = p.ImagemCapa != null
                    ? $"data:{p.ImagemCapa.ContentType};base64,{Convert.ToBase64String(p.ImagemCapa.Conteudo)}"
                    : null
            });

            return await publicacoes.ToListAsync();
        }
        internal async Task<PublicacaoResponse?> ObterPublicacaoPorIdAsync(int id)
        {
            return await _context.Publicacoes
                .Include(p => p.PublicadoPor)
                .Include(p => p.ImagemCapa)
                .Where(p => p.Id == id)
                .Select(p => new PublicacaoResponse
                {
                    Id = p.Id,
                    Tipo = p.Tipo.ToString(),
                    Titulo = p.Titulo,
                    Descricao = p.Descricao,
                    Data = p.Data,
                    Local = p.Local,
                    PublicadoEm = p.PublicadoEm,
                    NomePublicadoPor = p.PublicadoPor.UserName,
                    ImagemCapaBase64 = p.ImagemCapa != null
                    ? $"data:{p.ImagemCapa.ContentType};base64,{Convert.ToBase64String(p.ImagemCapa.Conteudo)}"
                    : null
                })
                .FirstOrDefaultAsync();
        }
        internal async Task<bool> DeletarPublicacaoAsync(int id)
        {
            var publicacao = await _context.Publicacoes
                .Include(p => p.ImagemCapa)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (publicacao == null)
                return false;

            if (publicacao.ImagemCapa != null)
                _context.Imagens.Remove(publicacao.ImagemCapa);

            _context.Publicacoes.Remove(publicacao);

            await _context.SaveChangesAsync();

            return true;
        }
        internal async Task<bool> EditarPublicacaoAsync(int id, EditarPublicacaoDto dto, Imagem? imagem)
        {
            var publicacao = await _context.Publicacoes
                .Include(p => p.ImagemCapa)
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

            if (imagem != null)
            {
                if (publicacao.ImagemCapa != null)
                    _context.Imagens.Remove(publicacao.ImagemCapa);

                publicacao.ImagemCapa = imagem;
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
