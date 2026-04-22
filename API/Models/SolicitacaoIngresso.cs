using API.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace API.Models
{
    public class SolicitacaoIngresso
    {
        public int Id { get; set; }

        [Required]
        public string NomeCompleto { get; set; } = null!;

        [Required]
        public string Matricula { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string EmailInstitucional { get; set; } = null!;

        [Required]
        public string Departamento { get; set; } = null!;

        public string? Mensagem { get; set; }

        public bool AceitaTermos { get; set; }

        public EnumeradorDeStatus StatusSolicitacao { get; set; }

        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    }
}