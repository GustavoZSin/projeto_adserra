using System.Text;
using System.Text.Json;

namespace API.Services
{
    public class SupabaseStorageService
    {
        private readonly HttpClient _httpClient;
        private readonly string _bucket;
        private readonly string _baseUrl;
        private readonly string _serviceKey;

        public SupabaseStorageService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _bucket = configuration["Supabase:Bucket"]!;
            _baseUrl = configuration["Supabase:Url"]!;
            _serviceKey = configuration["Supabase:ServiceKey"]!;
        }

        public async Task<string> UploadImagemAsync(IFormFile arquivo)
        {
            var extensao = Path.GetExtension(arquivo.FileName);
            var nomeArquivo = $"{Guid.NewGuid()}{extensao}";
            var caminho = $"imagens/{nomeArquivo}";
            var url = $"{_baseUrl}/storage/v1/object/{_bucket}/{caminho}";

            using var stream = arquivo.OpenReadStream();
            var content = new StreamContent(stream);
            content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(arquivo.ContentType);

            using var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
            request.Headers.Add("Authorization", $"Bearer {_serviceKey}");

            using var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var erro = await response.Content.ReadAsStringAsync();
                throw new Exception($"Erro ao enviar imagem ao Supabase: {erro}");
            }

            return caminho;
        }

        public async Task<string> GerarSignedUrlAsync(string caminhoArquivo, int expiraEmSegundos = 3600)
        {
            var url = $"{_baseUrl}/storage/v1/object/sign/{_bucket}/{caminhoArquivo}";
            var body = JsonSerializer.Serialize(new { expiresIn = expiraEmSegundos });

            var content = new StringContent(body, Encoding.UTF8, "application/json");
            using var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
            request.Headers.Add("Authorization", $"Bearer {_serviceKey}");

            using var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var erro = await response.Content.ReadAsStringAsync();
                throw new Exception($"Erro ao gerar signed URL: {erro}");
            }

            var json = await response.Content.ReadAsStringAsync();

            using var document = JsonDocument.Parse(json);
            var signedUrl = document.RootElement.GetProperty("signedURL").GetString();
            return $"{_baseUrl}/storage/v1{signedUrl}";
        }

        public async Task DeletarImagemAsync(string caminhoArquivo)
        {
            var url = $"{_baseUrl}/storage/v1/object/{_bucket}/{caminhoArquivo}";

            using var request = new HttpRequestMessage(HttpMethod.Delete, url);
            request.Headers.Add("Authorization", $"Bearer {_serviceKey}");

            await _httpClient.SendAsync(request);
        }
    }
}
