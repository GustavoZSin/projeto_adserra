namespace API.DTOs.Senha
{
    public class AlterarSenhaDto
    {
        public string SenhaAtual { get; set; } = null!;
        public string NovaSenha { get; set; } = null!;
        public string ConfirmarNovaSenha { get; set; } = null!;
    }
}