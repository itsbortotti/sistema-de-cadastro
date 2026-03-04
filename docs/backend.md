# Backend — Governança Financeira de Projetos

API REST em **Node.js** com **Express**, sessão por cookie e documentação **Swagger**. Persistência em arquivos JSON (sem banco de dados).

---

## Estrutura

```
backend/
├── server.js           # App Express, CORS, sessão, montagem de rotas, Swagger
├── middleware/
│   └── permissoes.js   # requireAuth, requirePermissaoPorMetodo
├── routes/             # Rotas por recurso (auth, usuarios, projetos, capex, etc.)
├── data/               # Acesso a dados (arquivos .js que leem/escrevem .json)
├── scripts/            # Scripts de migração/ajuste (ex.: associar projetos ao capex)
└── package.json
```

- **Rotas**: cada arquivo em `routes/` exporta um `express.Router()` e é montado em `server.js` sob `/api/...`.
- **Dados**: módulos em `data/` (ex.: `usuarios.js`, `projetos.js`) leem e gravam JSON em `data/*.json`.
- **Autenticação**: sessão via `express-session`; cookie enviado pelo frontend (proxy em desenvolvimento).

---

## Como rodar

### Pré-requisitos

- Node.js (versão LTS recomendada)

### Instalação e execução

```bash
cd backend
npm install
node server.js
```

Ou na raiz do projeto (se houver script):

```bash
npm start
```

- Servidor: **http://localhost:3001**
- Swagger: **http://localhost:3001/api-docs**

### Variáveis de ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta do servidor | `3001` |
| `SESSION_SECRET` | Chave da sessão (produção: usar valor seguro) | `sistema-cadastro-secret` |

Arquivo `.env` na pasta `backend/` (se existir) pode ser carregado com `dotenv`; o `server.js` atual usa `process.env.PORT` e `process.env.SESSION_SECRET`.

---

## Rotas protegidas

Quase todas as rotas (exceto auth e, conforme config, permissoes) passam por:

1. **requireAuth** — exige sessão; caso contrário retorna 401 com `{ erro: "Não autenticado" }`.
2. **requirePermissaoPorMetodo('entidade')** — verifica permissão do tipo do usuário (admin, membro, visualizacao) para a entidade e o método (GET → visualizar, POST → criar, PUT → editar, DELETE → excluir). Caso contrário retorna 403 com mensagem padrão.

Entidades configuradas em `server.js`: usuarios, fornecedores, areas, hospedagens, formas-acesso, times, produtos-software, projetos, capex, empresas. Permissões são definidas em `data/permissoes.js` e editáveis via API e tela de Configurações.

---

## Documentação da API

- **Padrões (erros, status, mensagens)**: [api-standards.md](api-standards.md)
- **Interface interativa**: http://localhost:3001/api-docs (Swagger UI)
- **Frontend (mensagens de erro)**: [ui-guidelines.md](ui-guidelines.md)

---

## Referências

- [api-standards.md](api-standards.md) — Formato de erro, status HTTP e convenções.
- [ui-guidelines.md](ui-guidelines.md) — Identidade visual e mensagens ao usuário.
