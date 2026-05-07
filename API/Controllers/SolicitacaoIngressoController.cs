using API.DTOs;
using API.Models;
using API.Models.Enums;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class SolicitacaoIngressoController : ControllerBase
    {
        private readonly SolicitacaoIngressoService _solicitacaoIngressoService;
        public SolicitacaoIngressoController(SolicitacaoIngressoService solicitacaoIngressoService)
        {
            _solicitacaoIngressoService = solicitacaoIngressoService;
        }

        [AllowAnonymous]
        [HttpPost("solicitar-ingresso")]
        public IActionResult SolicitarIngresso([FromBody] SolicitacaoIngressoDto dto)
        {
            if (!dto.AutorizaDesconto)
                return BadRequest("É necessário autorizar o desconto");

            var solicitacao = new SolicitacaoIngresso
            {
                NomeCompleto = dto.NomeCompleto,
                Matricula = dto.Matricula,
                EmailInstitucional = dto.Email,
                Departamento = dto.Departamento,
                Mensagem = dto.Mensagem,
                AceitaTermos = dto.AutorizaDesconto,
                StatusSolicitacao = EnumeradorDeStatus.Pendente,
            };

            var result = _solicitacaoIngressoService.CriarSolicitacao(solicitacao);

            if (result.Result)
                return Ok(new { message = "Solicitação de ingresso recebida com sucesso. Aguarde a análise do seu pedido." });
            else
                return BadRequest(new { message = "Falha ao processar a solicitação de ingresso. Tente novamente mais tarde." });
        }

        [HttpGet("listar-solicitacoes-por-status")]
        public IActionResult ListarSolicitacoesPorStatus([FromQuery] EnumeradorDeStatus status)
        {
            var solicitacoes = _solicitacaoIngressoService.ListarSolicitacoesPorStatus(status);
            return Ok(solicitacoes);
        }

        [HttpPost("aprovar-solicitacao")]
        public IActionResult AprovarSolicitacao([FromQuery] int id)
        {
            var result = _solicitacaoIngressoService.AprovarSolicitacao(id);

            if (result.Result)
                return Ok(new { message = "Solicitação de ingresso aprovada com sucesso." });
            else
                return BadRequest(new { message = "Falha ao aprovar a solicitação de ingresso. Tente novamente mais tarde." });
        }

        [HttpPost("reprovar-solicitacao")]
        public IActionResult ReprovarSolicitacao([FromQuery] int id)
        {
            var result = _solicitacaoIngressoService.ReprovarSolicitacao(id);

            if (result.Result)
                return Ok(new { message = "Solicitação de ingresso reprovada com sucesso." });
            else
                return BadRequest(new { message = "Falha ao reprovar a solicitação de ingresso. Tente novamente mais tarde." });
        }
    }
}