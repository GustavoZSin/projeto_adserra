using API.Models.Enums;

namespace API.DTOs
{
    public class EditarPublicacaoDto
    {
        public EnumeradorDeTipoDePublicacao? Tipo { get; set; }
        public string? Titulo { get; set; }
        public string? Descricao { get; set; }
        public DateTime? Data { get; set; }
        public string? Local { get; set; }
        public IFormFile? ImagemCapa { get; set; }
    }
}
