using API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<SolicitacaoIngresso> SolicitacoesIngresso { get; set; }
    public DbSet<Professor> Professores { get; set; }
    public DbSet<Publicacao> Publicacoes { get; set; }
    public DbSet<Imagem> Imagens { get; set; }
    public DbSet<PublicacaoImagem> PublicacaoImagens { get; set; }
    public DbSet<Notificacao> Notificacoes { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Professor -> User (Identity)
        builder.Entity<Professor>()
            .HasOne(p => p.Usuario)
            .WithOne()
            .HasForeignKey<Professor>(p => p.IdUsuario)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Professor>()
            .Property(p => p.NomeCompleto)
            .HasMaxLength(200);

        builder.Entity<Professor>()
            .Property(p => p.EmailInstitucional)
            .HasMaxLength(255);

        builder.Entity<Professor>()
            .Property(p => p.Matricula)
            .HasMaxLength(50);

        builder.Entity<Professor>()
            .Property(p => p.Departamento)
            .HasMaxLength(100);

        builder.Entity<SolicitacaoIngresso>()
            .Property(s => s.EmailInstitucional)
            .HasMaxLength(255);

        builder.Entity<SolicitacaoIngresso>()
            .Property(s => s.Matricula)
            .HasMaxLength(50);

        builder.Entity<SolicitacaoIngresso>()
            .Property(s => s.StatusSolicitacao)
            .HasConversion<int>();

        builder.Entity<Publicacao>()
            .HasOne(p => p.PublicadoPor)
            .WithMany()
            .HasForeignKey(p => p.PublicadoPorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Publicacao>()
            .Property(p => p.PublicadoEm)
            .HasColumnType("timestamp without time zone");

        builder.Entity<Publicacao>()
            .Property(p => p.Data)
            .HasColumnType("timestamp without time zone");

        builder.Entity<Publicacao>()
            .HasOne(p => p.ImagemCapa)
            .WithMany()
            .HasForeignKey(p => p.ImagemCapaId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<PublicacaoImagem>()
        .HasKey(pi => new { pi.PublicacaoId, pi.ImagemId });

        builder.Entity<PublicacaoImagem>()
            .HasOne(pi => pi.Publicacao)
            .WithMany(p => p.Imagens)
            .HasForeignKey(pi => pi.PublicacaoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<PublicacaoImagem>()
            .HasOne(pi => pi.Imagem)
            .WithMany()
            .HasForeignKey(pi => pi.ImagemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Notificacao>()
            .HasOne(n => n.Usuario)
            .WithMany()
            .HasForeignKey(n => n.IdUsuario)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Notificacao>()
            .Property(n => n.Tipo)
            .HasConversion<int>();

        builder.Entity<Notificacao>()
            .Property(n => n.DataCriacao)
            .HasColumnType("timestamp without time zone");
    }
}