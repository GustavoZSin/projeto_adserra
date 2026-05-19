namespace API.DTOs.Response
{
    public class NotificacaoResponse
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = null!;
        public string Descricao { get; set; } = null!;
        public string Tipo { get; set; } = null!;
        public bool Lida { get; set; }
        public DateTime DataCriacao { get; set; }
        public int? IdPublicacao { get; set; }
    }
}