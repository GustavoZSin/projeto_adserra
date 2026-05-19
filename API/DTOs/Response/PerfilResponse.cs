namespace API.DTOs.Response
{
    public class PerfilResponse
    {
        public int Id { get; set; }
        public string NomeCompleto { get; set; } = null!;
        public string? Matricula { get; set; }
        public string EmailInstitucional { get; set; } = null!;
        public string? Departamento { get; set; }
        public DateTime DataCriacao { get; set; }
    }
}