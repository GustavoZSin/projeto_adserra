using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class MigrarImagensParaStorage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Conteudo",
                table: "Imagens");

            migrationBuilder.AddColumn<string>(
                name: "CaminhoArquivo",
                table: "Imagens",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CaminhoArquivo",
                table: "Imagens");

            migrationBuilder.AddColumn<byte[]>(
                name: "Conteudo",
                table: "Imagens",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);
        }
    }
}
