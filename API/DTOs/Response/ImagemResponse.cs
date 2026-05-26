namespace API.DTOs.Response
{
    public record ImagemResponse(
        int Id,
        string NomeArquivo,
        string ContentType,
        DateTime CriadoEm,
        string CaminhoArquivo,
        string Url
    );
}
