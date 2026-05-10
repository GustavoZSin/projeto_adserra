using API.Models.Enums;

namespace API.DTOs
{
    public class PublicacaoDto
    {
        public EnumeradorDeTipoDePublicacao Tipo { get; set; }
        public string Titulo { get; set; } = null!;
        public string Descricao { get; set; } = null!;
        public DateTime Data { get; set; }
        public string? Local { get; set; }
        public IFormFile? ImagemCapa { get; set; }
    }
}
