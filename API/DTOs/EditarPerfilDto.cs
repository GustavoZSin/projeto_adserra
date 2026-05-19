namespace API.DTOs
{
    public class EditarPerfilDto
    {
        public string NomeCompleto { get; set; } = null!;
        public string EmailInstitucional { get; set; } = null!;
        public string? Departamento { get; set; }
    }
}