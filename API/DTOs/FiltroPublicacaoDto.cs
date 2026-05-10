using API.Models.Enums;

namespace API.DTOs
{
    public class FiltroPublicacaoDto
    {
        public EnumeradorDeTipoDePublicacao? Tipo { get; set; }
        public EnumeradorDeStatusPublicacaoTemporal? StatusTemporal { get; set; }
        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
    }
}
