using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class ADD_TBL_IMAGEM : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ImagemCapaId",
                table: "Publicacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Imagens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Conteudo = table.Column<byte[]>(type: "bytea", nullable: false),
                    ContentType = table.Column<string>(type: "text", nullable: false),
                    NomeArquivo = table.Column<string>(type: "text", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Imagens", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Publicacoes_ImagemCapaId",
                table: "Publicacoes",
                column: "ImagemCapaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Publicacoes_Imagens_ImagemCapaId",
                table: "Publicacoes",
                column: "ImagemCapaId",
                principalTable: "Imagens",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Publicacoes_Imagens_ImagemCapaId",
                table: "Publicacoes");

            migrationBuilder.DropTable(
                name: "Imagens");

            migrationBuilder.DropIndex(
                name: "IX_Publicacoes_ImagemCapaId",
                table: "Publicacoes");

            migrationBuilder.DropColumn(
                name: "ImagemCapaId",
                table: "Publicacoes");
        }
    }
}
