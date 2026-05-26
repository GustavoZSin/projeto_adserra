using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddIndexParaPerformance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Publicacoes_Data",
                table: "Publicacoes",
                column: "Data");

            migrationBuilder.CreateIndex(
                name: "IX_Publicacoes_Tipo_Publica",
                table: "Publicacoes",
                columns: new[] { "Tipo", "Publica" });

            migrationBuilder.CreateIndex(
                name: "IX_Notificacoes_IdUsuario_Lida",
                table: "Notificacoes",
                columns: new[] { "IdUsuario", "Lida" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Publicacoes_Data",
                table: "Publicacoes");

            migrationBuilder.DropIndex(
                name: "IX_Publicacoes_Tipo_Publica",
                table: "Publicacoes");

            migrationBuilder.DropIndex(
                name: "IX_Notificacoes_IdUsuario_Lida",
                table: "Notificacoes");
        }
    }
}
