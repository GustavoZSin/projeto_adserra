using API.Models.Enums;
using System.ComponentModel.DataAnnotations;
using static System.Net.Mime.MediaTypeNames;

namespace API.Models
{
    public class Publicacao
    {
        public int Id { get; set; }

        [Required]
        public EnumeradorDeTipoDePublicacao Tipo { get; set; }

        [Required]
        public string Titulo { get; set; } = null!;

        [Required]
        public string Descricao { get; set; } = null!;

        [Required]
        public DateTime Data { get; set; }

        public string? Local { get; set; }

        [Required]
        public string PublicadoPorId { get; set; } = null!;

        public User PublicadoPor { get; set; } = null!;

        public DateTime PublicadoEm { get; set; }

        public int? ImagemCapaId { get; set; }

        public Imagem? ImagemCapa { get; set; }
    }
}
