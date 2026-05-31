using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class ALTER_TBL_PUBLICACAO : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Rascunho",
                table: "Publicacoes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Publicacoes_Tipo_Rascunho",
                table: "Publicacoes",
                columns: new[] { "Tipo", "Rascunho" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Publicacoes_Tipo_Rascunho",
                table: "Publicacoes");

            migrationBuilder.DropColumn(
                name: "Rascunho",
                table: "Publicacoes");
        }
    }
}
