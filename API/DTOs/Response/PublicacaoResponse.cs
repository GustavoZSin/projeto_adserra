namespace API.DTOs.Response
{
    public class PublicacaoResponse
    {
        public int Id { get; set; }
        public string Tipo { get; set; }
        public string Titulo { get; set; }
        public string Descricao { get; set; }
        public DateTime Data { get; set; }
        public string Local { get; set; }
        public string NomePublicadoPor { get; set; }
        public DateTime PublicadoEm { get; set; }
        public string? ImagemCapaBase64 { get; set; }
    }
}
