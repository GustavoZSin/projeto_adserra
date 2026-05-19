using API.Models.Enums;

namespace API.Models
{
    public class Notificacao
    {
        public int Id { get; set; }
        public string IdUsuario { get; set; } = null!;
        public User Usuario { get; set; } = null!;
        public string Titulo { get; set; } = null!;
        public string Descricao { get; set; } = null!;
        public EnumeradorDeTipoDeNotificacao Tipo { get; set; }
        public bool Lida { get; set; } = false;
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
        public int? IdPublicacao { get; set; }
    }
}