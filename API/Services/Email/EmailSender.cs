using MailKit.Security;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Options;
using MimeKit;
using MailKit.Net.Smtp;

namespace API.Services.Email
{
    public class EmailSender(IOptions<SmtpSettings> smtpOptions) : IEmailSender
    {
        private readonly SmtpSettings _smtp = smtpOptions.Value;

        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            var message = new MimeMessage();

            message.From.Add(MailboxAddress.Parse(_smtp.From));
            message.To.Add(MailboxAddress.Parse(email));
            message.Subject = subject;

            message.Body = new TextPart("html") { Text = htmlMessage };

            using var client = new SmtpClient();

            await client.ConnectAsync(_smtp.Host, _smtp.Port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_smtp.User, _smtp.Password);

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
