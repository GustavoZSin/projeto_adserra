using Microsoft.AspNetCore.Identity.UI.Services;

namespace API.Services.Email
{
    public class EmailService
    {
        private readonly IEmailSender _emailSender;
        private readonly EmailTemplateService _template;

        public EmailService(IEmailSender emailSender, EmailTemplateService template)
        {
            _emailSender = emailSender;
            _template = template;
        }
        public async Task EnviarConfirmacao(string email, string link)
        {
            var html = _template.GerarEmailConfirmacao(link);
            await _emailSender.SendEmailAsync(email, "Confirmação de Acesso", html);
        }
        public async Task EnviarResetSenha(string email, string link)
        {
            var html = _template.GerarEmailResetSenha(link);
            await _emailSender.SendEmailAsync(email, "Redefinição de senha", html);
        }
    }
}
