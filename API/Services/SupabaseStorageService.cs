using System.Text;
using System.Text.Json;

namespace API.Services
{
    public class SupabaseStorageService(HttpClient httpClient, IConfiguration configuration)
    {
        private readonly HttpClient _httpClient = httpClient;
        private readonly IConfiguration _configuration = configuration;

        public async Task<string> UploadImagemAsync(IFormFile arquivo)
        {
            var bucket = _configuration["Supabase:Bucket"]!;
            var baseUrl = _configuration["Supabase:Url"]!;
            var serviceKey = _configuration["Supabase:ServiceKey"]!;

            var extensao = Path.GetExtension(arquivo.FileName);
            var nomeArquivo = $"{Guid.NewGuid()}{extensao}";
            var caminho = $"imagens/{nomeArquivo}";
            var url = $"{baseUrl}/storage/v1/object/{bucket}/{caminho}";

            using var stream = arquivo.OpenReadStream();
            using var content = new StreamContent(stream);

            content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(arquivo.ContentType);

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {serviceKey}");

            var response = await _httpClient.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var erro = await response.Content.ReadAsStringAsync();
                throw new Exception($"Erro ao enviar imagem ao Supabase: {erro}");
            }

            return caminho;
        }
        public async Task<string> GerarSignedUrlAsync(string caminhoArquivo, int expiraEmSegundos = 3600)
        {
            var bucket = _configuration["Supabase:Bucket"]!;
            var baseUrl = _configuration["Supabase:Url"]!;
            var serviceKey = _configuration["Supabase:ServiceKey"]!;

            var url = $"{baseUrl}/storage/v1/object/sign/{bucket}/{caminhoArquivo}";
            var body = JsonSerializer.Serialize(new { expiresIn = expiraEmSegundos });

            using var content = new StringContent(body, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {serviceKey}");

            var response = await _httpClient.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var erro = await response.Content.ReadAsStringAsync();
                throw new Exception($"Erro ao gerar signed URL: {erro}");
            }

            var json = await response.Content.ReadAsStringAsync();

            using var document = JsonDocument.Parse(json);
            var signedUrl = document.RootElement.GetProperty("signedURL").GetString();
            return $"{baseUrl}/storage/v1{signedUrl}";
        }
        public async Task DeletarImagemAsync(string caminhoArquivo)
        {
            var bucket = _configuration["Supabase:Bucket"]!;
            var baseUrl = _configuration["Supabase:Url"]!;
            var serviceKey = _configuration["Supabase:ServiceKey"]!;
            var url = $"{baseUrl}/storage/v1/object/{bucket}/{caminhoArquivo}";

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {serviceKey}");

            await _httpClient.DeleteAsync(url);
        }
    }
}
