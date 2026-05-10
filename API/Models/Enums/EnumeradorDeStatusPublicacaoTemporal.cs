using System.Text.Json.Serialization;

namespace API.Models.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum EnumeradorDeStatusPublicacaoTemporal
    {
        Futuras = 0,
        Passadas = 1,
        Todas = 2
    }
}
