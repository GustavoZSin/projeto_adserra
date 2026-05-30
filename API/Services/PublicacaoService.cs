using API.Data;
using API.DTOs.ListagemPublicacoes;
using API.DTOs.Publicacoes;
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
        internal async Task<List<PublicacaoResponse>> ListarPublicacoesAsync(FiltroPublicacaoUsuarioAutenticadoDto filtro)
        {
            var query = MontarQueryBaseListagemPublicacoes(filtro);

            if (filtro.Publicas.HasValue)
                query = query.Where(p => p.Publica == filtro.Publicas.Value);

            return await MontarRespostaPublicacoesAsync(query);
        }
        internal async Task<List<PublicacaoResponse>> ListarPublicacoesPublicasAsync(FiltroPublicacaoDto filtro)
        {
            var query = MontarQueryBaseListagemPublicacoes(filtro).Where(p => p.Publica);
            return await MontarRespostaPublicacoesAsync(query);
        }
        internal async Task<PublicacaoResponse?> ObterPublicacaoPorIdAsync(int id)
        {
            var publicacao = await _context.Publicacoes
                .AsNoTracking()
                .Include(x => x.PublicadoPor)
                .Include(x => x.ImagemCapa)
                .Include(x => x.Imagens).ThenInclude(pi => pi.Imagem)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (publicacao == null)
                return null;

            var urlMap = await GerarUrlsAssinadasAsync(ObterCaminhosImagens(publicacao));

            return CriarResponse(publicacao, urlMap);
        }
        internal async Task<(bool Sucesso, Publicacao? PublicadaAgora)> EditarPublicacaoAsync(int id, EditarPublicacaoDto dto, Imagem? imagemCapa, List<PublicacaoImagem> imagensGaleria)
        {
            var publicacao = await _context.Publicacoes
                .Include(p => p.ImagemCapa)
                .Include(p => p.Imagens).ThenInclude(pi => pi.Imagem)
                .Include(p => p.PublicadoPor)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (publicacao == null)
                return (false, null);

            var eraRascunho = !publicacao.Publica;

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
                await RemoverImagemCapaAsync(publicacao);

                publicacao.ImagemCapa = imagemCapa;
            }

            if (dto.Publica.HasValue)
                publicacao.Publica = dto.Publica.Value;

            if (imagensGaleria != null && imagensGaleria.Count != 0)
            {
                await RemoverImagensGaleriaAsync(publicacao);

                publicacao.Imagens.Clear();

                foreach (var imagem in imagensGaleria)
                    publicacao.Imagens.Add(imagem);
            }

            await _context.SaveChangesAsync();

            var transitouParaPublico = eraRascunho && publicacao.Publica;
            return (true, transitouParaPublico ? publicacao : null);
        }
        internal async Task<bool> DeletarPublicacaoAsync(int id)
        {
            var publicacao = await _context.Publicacoes
                .Include(p => p.ImagemCapa)
                .Include(x => x.Imagens).ThenInclude(pi => pi.Imagem)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (publicacao == null)
                return false;

            await RemoverImagensGaleriaAsync(publicacao);
            await RemoverImagemCapaAsync(publicacao);

            _context.Publicacoes.Remove(publicacao);

            await _context.SaveChangesAsync();

            return true;
        }
        internal async Task<string> UploadImagemAsync(IFormFile arquivo)
        {
            return await _storageService.UploadImagemAsync(arquivo);
        }

        #region Métodos Auxiliares
        private IQueryable<Publicacao> MontarQueryBaseListagemPublicacoes(FiltroPublicacaoDto filtro)
        {
            var query = _context.Publicacoes
                .AsNoTracking()
                .Include(p => p.ImagemCapa)
                .Include(p => p.PublicadoPor)
                .Include(p => p.Imagens).ThenInclude(pi => pi.Imagem)
                .AsQueryable();

            if (filtro.Tipo.HasValue)
                query = query.Where(p => p.Tipo == filtro.Tipo.Value);

            var hoje = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

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
                query = query.Where(p => p.Data >= DateTime.SpecifyKind(filtro.DataInicio.Value, DateTimeKind.Unspecified));

            if (filtro.DataFim.HasValue)
                query = query.Where(p => p.Data <= DateTime.SpecifyKind(filtro.DataFim.Value, DateTimeKind.Unspecified));

            return query;
        }
        private async Task<List<PublicacaoResponse>> MontarRespostaPublicacoesAsync(IQueryable<Publicacao> query)
        {
            var publicacoes = await query.ToListAsync();

            var urlMap = await GerarUrlsAssinadasAsync(ObterCaminhosImagens(publicacoes));

            return publicacoes.Select(p => CriarResponse(p, urlMap)).ToList();
        }
        private PublicacaoResponse CriarResponse(Publicacao publicacao, Dictionary<string, string> urlMap)
        {
            var imagemCapaUrl = publicacao.ImagemCapa != null && urlMap.TryGetValue(publicacao.ImagemCapa.CaminhoArquivo, out var url) ? url : null;

            var imagensPublicacao = publicacao.Imagens
                .Where(x => x.Imagem != null)
                .Select(x => new ImagemPublicacaoResponse
                {
                    Id = x.Imagem.Id,
                    URL = urlMap[x.Imagem.CaminhoArquivo]
                })
                .ToList();

            return new PublicacaoResponse
            {
                Id = publicacao.Id,
                Tipo = publicacao.Tipo.ToString(),
                Titulo = publicacao.Titulo,
                Descricao = publicacao.Descricao,
                Data = publicacao.Data,
                Local = publicacao.Local,
                PublicadoEm = publicacao.PublicadoEm,
                NomePublicadoPor = publicacao.PublicadoPor.UserName!,
                ImagemCapaUrl = imagemCapaUrl,
                Publica = publicacao.Publica,
                ImagensPublicacao = imagensPublicacao.Count > 0 ? imagensPublicacao : null
            };
        }
        #endregion

        #region Imagens
        private static List<string> ObterCaminhosImagens(IEnumerable<Publicacao> publicacoes)
        {
            return publicacoes
                .SelectMany(p =>
                {
                    var caminhos = new List<string?>();

                    if (p.ImagemCapa != null)
                        caminhos.Add(p.ImagemCapa.CaminhoArquivo);

                    caminhos.AddRange(p.Imagens.Where(i => i.Imagem != null).Select(i => i.Imagem.CaminhoArquivo));

                    return caminhos;
                })
                .Where(c => !string.IsNullOrWhiteSpace(c))
                .Distinct()
                .Cast<string>()
                .ToList();
        }
        private static List<string> ObterCaminhosImagens(Publicacao publicacao)
        {
            return ObterCaminhosImagens([publicacao]);
        }
        private async Task<Dictionary<string, string>> GerarUrlsAssinadasAsync(IEnumerable<string> caminhos)
        {
            var lista = caminhos.Distinct().ToList();

            if (lista.Count == 0) return new();

            var tarefas = lista
                .Select(async caminho => new
                {
                    Caminho = caminho,
                    Url = await _storageService.GerarSignedUrlAsync(caminho)
                });

            var resultado = await Task.WhenAll(tarefas);
            return resultado.ToDictionary(x => x.Caminho, x => x.Url);
        }
        private async Task RemoverImagemCapaAsync(Publicacao publicacao)
        {
            if (publicacao.ImagemCapa == null)
                return;

            await _storageService.DeletarImagemAsync(publicacao.ImagemCapa.CaminhoArquivo);

            _context.Imagens.Remove(publicacao.ImagemCapa);
        }
        private async Task RemoverImagensGaleriaAsync(Publicacao publicacao)
        {
            foreach (var item in publicacao.Imagens)
            {
                await _storageService.DeletarImagemAsync(item.Imagem.CaminhoArquivo);
                _context.Imagens.Remove(item.Imagem);
            }
        }
        #endregion
    }
}
