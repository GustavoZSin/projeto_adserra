namespace API.DTOs.Senha
{
    public class ResetarSenhaDto
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public string NovaSenha { get; set; }
    }
}
