using API.Data;
using API.DTOs.Response;
using API.Models;
using API.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class NotificacaoService(AppDbContext context)
    {
        private readonly AppDbContext _context = context;

        public async Task CriarNotificacoesParaPublicacaoAsync(Publicacao publicacao, string idPublicador)
        {
            var usuarios = await _context.Users
                .Where(u => u.Id != idPublicador)
                .Select(u => u.Id)
                .ToListAsync();

            var titulo = GerarTitulo(publicacao);
            var tipo = MapTipo(publicacao.Tipo);

            var notificacoes = usuarios.Select(idUsuario => new Notificacao
            {
                IdUsuario = idUsuario,
                Titulo = titulo,
                Descricao = publicacao.Descricao,
                Tipo = tipo,
                Lida = false,
                DataCriacao = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                IdPublicacao = publicacao.Id
            });

            _context.Notificacoes.AddRange(notificacoes);
            await _context.SaveChangesAsync();
        }

        public async Task<List<NotificacaoResponse>> ListarAsync(string idUsuario, string? status)
        {
            var query = _context.Notificacoes
                .Where(n => n.IdUsuario == idUsuario);

            query = status switch
            {
                "nao-lidas" => query.Where(n => !n.Lida),
                "lidas" => query.Where(n => n.Lida),
                _ => query
            };

            return await query
                .OrderByDescending(n => n.DataCriacao)
                .Select(n => new NotificacaoResponse
                {
                    Id = n.Id,
                    Titulo = n.Titulo,
                    Descricao = n.Descricao,
                    Tipo = n.Tipo.ToString(),
                    Lida = n.Lida,
                    DataCriacao = n.DataCriacao,
                    IdPublicacao = n.IdPublicacao
                })
                .ToListAsync();
        }

        public async Task<int> ContarNaoLidasAsync(string idUsuario)
        {
            return await _context.Notificacoes
                .CountAsync(n => n.IdUsuario == idUsuario && !n.Lida);
        }

        public async Task<bool> MarcarComoLidaAsync(string idUsuario, int idNotificacao)
        {
            var notificacao = await _context.Notificacoes
                .FirstOrDefaultAsync(n => n.Id == idNotificacao && n.IdUsuario == idUsuario);

            if (notificacao == null)
                return false;

            notificacao.Lida = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task MarcarTodasComoLidasAsync(string idUsuario)
        {
            await _context.Notificacoes
                .Where(n => n.IdUsuario == idUsuario && !n.Lida)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.Lida, true));
        }

        private static string GerarTitulo(Publicacao publicacao)
        {
            var nomePublicador = publicacao.PublicadoPor?.UserName ?? "Administrador";
            return publicacao.Tipo switch
            {
                EnumeradorDeTipoDePublicacao.Evento => $"{nomePublicador} publicou um novo evento",
                EnumeradorDeTipoDePublicacao.Acao => $"{nomePublicador} adicionou fotos à galeria",
                EnumeradorDeTipoDePublicacao.Noticia => $"{nomePublicador} publicou uma notícia",
                EnumeradorDeTipoDePublicacao.Aviso => $"{nomePublicador} publicou um aviso",
                _ => "Nova notificação do sistema"
            };
        }

        private static EnumeradorDeTipoDeNotificacao MapTipo(EnumeradorDeTipoDePublicacao tipo)
        {
            return tipo switch
            {
                EnumeradorDeTipoDePublicacao.Evento => EnumeradorDeTipoDeNotificacao.NovoEvento,
                EnumeradorDeTipoDePublicacao.Acao => EnumeradorDeTipoDeNotificacao.Acao,
                EnumeradorDeTipoDePublicacao.Noticia => EnumeradorDeTipoDeNotificacao.Noticia,
                EnumeradorDeTipoDePublicacao.Aviso => EnumeradorDeTipoDeNotificacao.Aviso,
                _ => EnumeradorDeTipoDeNotificacao.Sistema
            };
        }
    }
}