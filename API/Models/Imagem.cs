using System.ComponentModel.DataAnnotations;

namespace API.Models
{
    public class Imagem
    {
        public int Id { get; set; }

        [Required]
        public byte[] Conteudo { get; set; } = null!;

        [Required]
        public string ContentType { get; set; } = null!;

        [Required]
        public string NomeArquivo { get; set; } = null!;

        public DateTime CriadoEm { get; set; } = DateTime.Now;
    }
}
