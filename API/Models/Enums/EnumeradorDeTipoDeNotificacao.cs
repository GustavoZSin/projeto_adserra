using System.Text.Json.Serialization;

namespace API.Models.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum EnumeradorDeTipoDeNotificacao
    {
        NovoEvento = 0,
        Acao = 1,
        Noticia = 2,
        Aviso = 3,
        Sistema = 4
    }
}