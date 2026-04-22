namespace API.DTOs
{
    public class SolicitacaoIngressoDto
    {
        public string NomeCompleto { get; set; }
        public string Matricula { get; set; }
        public string EmailInstitucional { get; set; }
        public string Departamento { get; set; }
        public string Mensagem { get; set; }
        public bool AceitaTermos { get; set; }
    }
}
