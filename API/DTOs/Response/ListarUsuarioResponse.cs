namespace API.DTOs.Response
{
    public class ListarUsuarioResponse
    {
        public int Id { get; internal set; }
        public string NomeCompleto { get; internal set; }
        public string Matricula { get; internal set; }
        public string EmailInstitucional { get; internal set; }
        public string Departamento { get; internal set; }
    }
}
