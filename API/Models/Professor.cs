using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public class Professor
    {
        public int Id { get; set; }
        public string NomeCompleto { get; set; } = null!;
        public string Matricula { get; set; } = null!;
        public string EmailInstitucional { get; set; } = null!;
        public string Departamento { get; set; } = null!;
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
        public string IdUsuario { get; set; } = null!;
        public User Usuario { get; set; } = null!;
    }
}
