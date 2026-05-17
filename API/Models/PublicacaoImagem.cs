namespace API.Models
{
    public class PublicacaoImagem
    {
        public int PublicacaoId { get; set; }
        public Publicacao Publicacao { get; set; } = null!;

        public int ImagemId { get; set; }
        public Imagem Imagem { get; set; } = null!;

        public int Ordem { get; set; }
    }
}
