using System.Text.Json.Serialization;

namespace API.Models.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum EnumeradorDeTipoDePublicacao
    {
        Evento = 0,
        Acao = 1,
        Noticia = 2,
        Aviso = 3
    }
}
