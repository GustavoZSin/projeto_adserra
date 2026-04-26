namespace API.DTOs
{
    public class RegistrarAdminDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string NomeCompleto { get; set; }
    }
}
