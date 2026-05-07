namespace API.DTOs
{
    public class SolicitacaoIngressoDto
    {
        public string NomeCompleto { get; set; }
        public string Matricula { get; set; }
        public string Email { get; set; }
        public string Departamento { get; set; }
        public string Mensagem { get; set; }
        public bool AutorizaDesconto { get; set; }
    }
}
