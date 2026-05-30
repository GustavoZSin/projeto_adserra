using API.DTOs.ListagemPublicacoes;

namespace API.DTOs.Publicacoes
{
    public class FiltroPublicacaoUsuarioAutenticadoDto : FiltroPublicacaoDto
    {
        public bool? Publicas { get; set; }
    }
}
