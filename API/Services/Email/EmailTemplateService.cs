namespace API.Services.Email
{
    public class EmailTemplateService
    {
        public string GerarEmailResetSenha(string link)
        {
            return $@"
                <h2>Redefinição de senha</h2>
                <p>Clique no link abaixo para redefinir sua senha:</p>
                <a href='{link}'>Resetar senha</a>
                <p>Se você não solicitou isso, ignore este email.</p>
            ";
        }

        public string GerarEmailConfirmacao(string link)
        {
            return $@"
                <h2>Confirmação de conta</h2>
                <p>Clique no link abaixo para confirmar seu email:</p>
                <a href='{link}'>Confirmar email</a>
            ";
        }
    }
}
