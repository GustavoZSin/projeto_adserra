# ADSerra — Frontend Web

Frontend React do Portal do Professor, integrado ao backend C# (ASP.NET Core).

## Pré-requisitos

- Node.js 18+
- Backend C# rodando (padrão: `https://localhost:7000`)

## Instalação

```bash
cd web
npm install
```

## Desenvolvimento

```bash
npm run dev
```

O Vite sobe em `http://localhost:5173` e faz proxy das rotas `/auth` e `/Auth`
automaticamente para o backend, evitando problemas de CORS.

## Estrutura

```
src/
├── components/
│   ├── layout/
│   │   └── PrivateRoute.jsx     # Protege rotas autenticadas
│   └── ui/
│       ├── Button.jsx           # Botão (primary / ghost)
│       ├── Input.jsx            # Input + Textarea
│       └── Logo.jsx             # Logo SVG ADSerra
├── contexts/
│   └── AuthContext.jsx          # Estado global de autenticação
├── pages/
│   ├── LoginPage.jsx            # Tela de login (mobile + web)
│   └── InteressePage.jsx        # Formulário de solicitação de ingresso
├── services/
│   └── api.js                   # Axios + chamadas à API
├── styles/
│   └── globals.css              # Design tokens (dark/light)
├── App.jsx                      # Roteamento
└── main.jsx                     # Entry point
```

## Rotas

| Rota          | Acesso    | Descrição                          |
|---------------|-----------|------------------------------------|
| `/login`      | Pública   | Login com matrícula + senha        |
| `/interesse`  | Pública   | Formulário de solicitação ingresso |
| `/dashboard`  | Protegida | Dashboard principal (em construção)|

## Temas

O tema padrão é light. Para alternar, mude o atributo `data-theme` no `<html>`:
- `data-theme="light"`
- `data-theme="dark"`

## Próximos passos

- Implementar `DashboardPage` em `src/pages/`
- Adicionar mais rotas protegidas conforme as telas do design
