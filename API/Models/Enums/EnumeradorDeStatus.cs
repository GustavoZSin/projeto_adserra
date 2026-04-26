using System.Text.Json.Serialization;

namespace API.Models.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum EnumeradorDeStatus
    {
        Pendente = 0,
        Aprovado = 1,
        Reprovado = 2
    }
}
