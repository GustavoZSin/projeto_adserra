using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class ALTER_TBL_PROFESSORES : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SolicitacaoIngressoId",
                table: "Professores",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Professores_SolicitacaoIngressoId",
                table: "Professores",
                column: "SolicitacaoIngressoId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Professores_SolicitacoesIngresso_SolicitacaoIngressoId",
                table: "Professores",
                column: "SolicitacaoIngressoId",
                principalTable: "SolicitacoesIngresso",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Professores_SolicitacoesIngresso_SolicitacaoIngressoId",
                table: "Professores");

            migrationBuilder.DropIndex(
                name: "IX_Professores_SolicitacaoIngressoId",
                table: "Professores");

            migrationBuilder.DropColumn(
                name: "SolicitacaoIngressoId",
                table: "Professores");
        }
    }
}
