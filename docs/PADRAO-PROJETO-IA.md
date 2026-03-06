# Padrão do Projeto — Governança Financeira de Portfólio (Prompt para IA)

**Documento unificado:** arquitetura, API, UI, segurança e CI/CD. Use este arquivo como referência única e como prompt para ferramentas de IA ao implementar ou revisar código neste repositório.

---

## Instruções para a IA

Ao trabalhar neste projeto, **sempre**:

1. **Manter a arquitetura** descrita abaixo: backend Node.js/Express com Prisma/PostgreSQL; frontend React (Vite); sessão por cookie; rotas protegidas por `requireAuth` e `requirePermissaoPorMetodo`.
2. **Respeitar o formato de erro da API:** todas as respostas de erro usam `{ erro: "mensagem em PT-BR" }` (nunca `message` nem `detail`). Mensagens em português com acentuação correta.
3. **Seguir a identidade visual:** variáveis CSS em `frontend/src/index.css` (--ts-laranja, --ts-azul, --ts-ciano, etc.); tipografia Archivo Black (H1) e Lato (corpo); botões primário (Laranja Solve) e secundário (Azul TS).
4. **Garantir segurança:** config centralizada (`backend/config`), Helmet, rate limit no login, sessão com secret obrigatório em produção, CORS por variável de ambiente, store de sessão em PostgreSQL quando `DATABASE_URL` existir, validação com express-validator e `validateIdParam` em rotas com `:id`.
5. **Tratar erros de forma uniforme:** no backend, usar `next(err)` no catch; middleware global `errorHandler` formata a resposta. No frontend, usar as mensagens de `api/client.js` (401, 403, 404, 500, rede).
6. **Registrar auditoria onde fizer sentido:** usar `registrarLog` (lib/logHelper) em login e em criação/edição/exclusão de entidades quando o padrão do projeto já o fizer (ex.: auth, usuarios, perfis).
7. **Não duplicar autenticação:** rotas protegidas já recebem `requireAuth` e `requirePermissaoPorMetodo` em `server.js`; não adicionar `requireAuth` nas rotas individuais.
8. **Acessibilidade:** modais com `role="dialog"`, `aria-modal="true"` e `aria-labelledby`; labels e mensagens em português.

---

## Arquitetura geral

- **Backend:** Node.js, Express, Prisma (PostgreSQL), sessão (express-session + connect-pg-simple), Swagger (JSDoc nas rotas).
- **Frontend:** React, Vite, React Router, contexto de Auth e Permissões; chamadas à API com `credentials: 'include'`.
- **Autenticação:** sessão por cookie (`connect.sid`). Permissões por perfil (Perfil → Permissao por entidade e ação: visualizar, editar, criar, excluir).

---

## Estrutura do backend

```
backend/
├── server.js              # Express, Helmet, CORS, sessão, rate limit (auth), rotas, Swagger, 404 /api, errorHandler
├── config/
│   ├── index.js            # PORT, CORS_ORIGIN, session (secret, cookie.secure), rateLimitAuth (dotenv)
│   └── constants.js        # PAGINATION_*, BODY_JSON_LIMIT, LOGS_*, LOGIN_*, NOME_MAX_LENGTH, etc.
├── validators/
│   ├── common.js           # handleValidation (express-validator)
│   ├── auth.js             # validateLogin
│   └── usuarios.js         # validateCreateUsuario, validateUpdateUsuario
├── lib/
│   ├── prisma.js           # Cliente Prisma (singleton)
│   └── logHelper.js        # registrarLog(tipo, descricao, usuarioId)
├── prisma/
│   ├── schema.prisma       # Modelos e datasource PostgreSQL
│   ├── migrations/
│   ├── seed.js             # Perfis padrão, admin, permissões, dados iniciais
│   └── import-from-json.js # Importação única de JSON legado (se houver)
├── middleware/
│   ├── permissoes.js       # requireAuth, requirePermissaoPorMetodo(entidade)
│   ├── errorHandler.js    # next(err) → status e { erro } em JSON
│   └── validateId.js       # validateIdParam (CUID em rotas :id)
├── routes/                 # auth, usuarios, perfis, logs, projetos, capex, empresas, etc.
├── data/                   # Camada de dados com Prisma
├── scripts/
│   └── reset-admin.js      # Garante admin com senha "admin"
└── test/                   # Jest (setup.js, data/, lib/, middleware/, routes/)
```

- Rotas em `routes/` exportam `express.Router()` e são montadas em `server.js` sob `/api/...`.
- Rotas não encontradas em `/api/*` retornam **404** com `{ erro: "Não encontrado" }` (middleware antes do errorHandler).
- Em produção o servidor **não inicia** sem `SESSION_SECRET`.

---

## Padrões da API

### Formato de erro

- Campo único: **`erro`** (string em PT-BR, acentuado).
- Exemplo: `{ "erro": "O registro solicitado não foi encontrado." }`.

### Status HTTP e mensagens

| Status | Situação                 | Exemplo / padrão |
|--------|--------------------------|------------------|
| 400    | Validação / dados inválidos | "Nome é obrigatório", "Login e senha são obrigatórios" |
| 401    | Não autenticado          | "Não autenticado" |
| 401    | Login inválido           | "Login ou senha inválidos" |
| 403    | Sem permissão            | "Você não tem permissão para realizar esta ação." |
| 404    | Recurso não encontrado   | "Não encontrado" / "Usuário não encontrado" (quando aplicável) |
| 500    | Erro interno             | "Ocorreu um erro inesperado. Tente novamente." (não expor detalhes) |

### Convenções de sucesso

| Método    | Ação     | Status   | Body |
|-----------|----------|----------|------|
| GET       | Listar   | 200      | Array ou objeto com lista |
| GET       | Buscar id| 200      | Objeto do recurso |
| POST      | Criar    | 201 (ou 200) | Recurso criado |
| PUT/PATCH | Atualizar| 200      | Recurso atualizado |
| DELETE    | Remover  | 200 ou 204 | Opcional: body vazio |

### Autenticação e permissões

- Autenticação: sessão (cookie `connect.sid`).
- Rotas protegidas: middleware `requireAuth` (401 se não houver sessão).
- Permissões: `requirePermissaoPorMetodo('entidade')` (403 se o perfil não tiver permissão para o método: GET→visualizar, POST→criar, PUT→editar, DELETE→excluir).

### Documentação

- Swagger UI: `http://localhost:3001/api-docs`
- Definições nos arquivos `backend/routes/*.js` via JSDoc `@swagger`.

### Endpoints principais (resumo)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/login | Login (body: login, senha) |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/sessao | Usuário da sessão atual |
| GET/POST | /api/usuarios | Listar / criar |
| GET/PUT/DELETE | /api/usuarios/:id | Buscar / atualizar / remover |
| GET | /api/permissoes/me | Permissões do usuário logado |
| GET/POST | /api/perfis, /api/logs, /api/projetos, /api/capex, /api/empresas, ... | Demais recursos (sempre com requireAuth + requirePermissaoPorMetodo) |

Lista completa em **http://localhost:3001/api-docs**.

---

## Frontend — UI e identidade visual

### Paleta (variáveis em `frontend/src/index.css`)

- **Primárias:** Laranja Solve `#ff401a` (CTAs, H1), Ciano Tech `#02b0c6` (links, ícones), Azul TS `#131b71` (sidebar/navbar, texto).
- **Secundárias:** Laranja Light `#ff8168`, Ciano Light `#87e6fb`, Azul Light `#282f7d`, Branco, Cinza, Cinza Escuro.
- **Semânticas:** Sucesso `#2E7D32`, Erro `#ff401a`, Alerta `#F9A825`, Info `#02b0c6`.

Variáveis CSS: `--ts-laranja`, `--ts-azul`, `--ts-ciano`, `--ts-branco`, `--ts-cinza`, `--ts-cinza-escuro`, `--ts-erro`, etc., e tipografia `--ts-h1`, `--ts-h2`, `--ts-body`, etc.

### Tipografia

- **H1:** Archivo Black, cor Laranja Solve.
- **H2/H3:** Lato Bold, Azul TS.
- **Body:** Lato Regular, Cinza Escuro / Azul TS.
- **Botões:** Lato Bold, texto Branco. Primário: fundo Laranja Solve; Secundário: fundo Azul TS.

Fontes: Google Fonts (Archivo Black, Lato) em `frontend/index.html`.

### Menu e layout

- Itens de menu em ordem alfabética (exceto quando o fluxo exigir outra ordem).
- Sidebar: fundo Azul TS; link ativo com destaque Laranja Solve.

### Tratamento de erros no frontend

- Todo erro exibido ao usuário (inline, dialog ou toast). Mensagens em português, sem jargão.
- Desligar loading antes de tratar erro.
- Mensagens padrão em `frontend/src/api/client.js`:

| Situação    | Mensagem |
|------------|----------|
| 401        | "Sua sessão expirou. Faça login novamente." |
| 403        | "Você não tem permissão para realizar esta ação." |
| 404        | "O registro solicitado não foi encontrado." |
| 500        | "Ocorreu um erro inesperado. Tente novamente." |
| Sem conexão| "Não foi possível conectar ao servidor. Verifique sua conexão." |
| Login inválido | "Login ou senha inválidos." |

### Acessibilidade

- Modais: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` no título.
- Labels e mensagens em português com acentuação correta.

### Testes (frontend)

- Vitest + React Testing Library + jsdom.
- Execução: `cd frontend && npm run test` (ou `npm run test:run` para CI).
- Setup: `frontend/src/test/setup.js`; testes em `*.test.jsx` / `*.spec.js`.

---

## Segurança (implementado e obrigatório)

- **Helmet:** headers de segurança (CSP desabilitado para Swagger UI).
- **Rate limit no login:** 5 tentativas a cada 15 minutos por IP (`express-rate-limit` em `/api/auth/login`).
- **SESSION_SECRET:** em produção, obrigatório; servidor não inicia se estiver vazio.
- **Cookie:** `httpOnly: true`; `secure` via `COOKIE_SECURE` ou em produção.
- **CORS:** origem via variável `CORS_ORIGIN` (ex.: `http://localhost:5173`); não usar `*` com credenciais.
- **Body JSON:** limite via `constants.BODY_JSON_LIMIT` (ex.: 500kb).
- **Store de sessão:** `connect-pg-simple` com PostgreSQL quando `DATABASE_URL` está definido.
- **Validação:** express-validator no login e em usuários; `validateIdParam` (CUID) em todas as rotas com `:id`.
- **Erros 500:** mensagem genérica ao cliente; detalhes apenas em log no servidor.

---

## Backend — Como rodar

### Variáveis de ambiente (`backend/.env`)

Copiar de `backend/.env.example`. Exemplo:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gestao_portfolio?schema=public"
PORT=3001
SESSION_SECRET=sistema-cadastro-secret
# CORS_ORIGIN=http://localhost:5173
# COOKIE_SECURE=false (em prod com HTTPS: true)
```

### Ordem recomendada

1. Criar banco PostgreSQL (ex.: `CREATE DATABASE gestao_portfolio;`).
2. `cd backend && npm install` (roda `prisma generate` no postinstall).
3. `npx prisma migrate deploy` (aplicar migrations).
4. `npm run db:seed` (perfis, admin, permissões, dados iniciais).
5. `npm start` (produção) ou `npm run dev` (desenvolvimento com nodemon).

### Comandos úteis

| Comando | Descrição |
|---------|------------|
| `npm start` | Inicia o servidor |
| `npm run dev` | Servidor com nodemon (reinicia ao salvar) |
| `npx prisma migrate deploy` | Aplica migrations pendentes |
| `npm run db:seed` | Seed (perfis, admin, permissões) |
| `npm run db:studio` | Prisma Studio |
| `node scripts/reset-admin.js` | Garante admin com senha "admin" |
| `npm test` | Testes Jest |

---

## CI/CD — Bitbucket

### Variáveis do repositório

Configurar em **Repository settings → Pipelines → Repository variables**:

| Variável | Obrigatória | Secured | Uso |
|----------|-------------|---------|-----|
| `BITBUCKET_APP_PASSWORD` | Para PRs automáticos | Sim | App Password com "Pull requests: Write" |
| `BITBUCKET_USER` | Não | Não | Usuário Bitbucket |
| `SONAR_TOKEN` | Para Sonar | Sim | Token SonarCloud/SonarQube |
| `SONAR_ORGANIZATION` | Se usar Sonar | Não | Organização no SonarCloud |
| `SONAR_PROJECT_KEY` | Se usar Sonar | Não | Chave do projeto |

**App Password:** Personal settings → App passwords → Create; permissão "Pull requests: Write". Criar variável `BITBUCKET_APP_PASSWORD` como Secured.

### Branches

- **main:** branch principal.
- **dev, hml:** criadas a partir de `main` e enviadas ao remoto (`git checkout -b dev`, `git push -u origin dev`, idem para `hml`).
- **feature/***: criadas para desenvolvimento; o pipeline pode criar PRs (feature → dev, dev → hml, hml → main).

Criar branches pelo Git:

```bash
git checkout main
git checkout -b dev && git push -u origin dev
git checkout main && git checkout -b hml && git push -u origin hml
git checkout main
```

### Aprovação antes do merge

Em **Repository settings → Workflow → Branch restrictions** (ou Pull request merge checks):

- Branch pattern: `*` ou `main`/`dev`/`hml`.
- **Minimum number of approvals:** 1 (ou mais). Aprovação do autor não conta.

---

## Resumo para consistência

- **API:** sempre `{ erro: "mensagem" }` em PT-BR; 404 em JSON para rotas `/api` inexistentes; `next(err)` e errorHandler global.
- **Backend:** config em `config/`, constantes em `config/constants.js`, validadores em `validators/`, IDs validados com `validateIdParam`, logs de auditoria via `registrarLog` onde já usado.
- **Frontend:** cores e tipografia via variáveis do `index.css`; mensagens de erro do `api/client.js`; modais acessíveis (role, aria).
- **Segurança:** Helmet, rate limit no login, SESSION_SECRET obrigatório em produção, CORS e cookie por env, store de sessão em PostgreSQL quando houver DATABASE_URL.

Este documento substitui e unifica: api-standards.md, backend.md, ui-guidelines.md, bitbucket-variaveis.md, bitbucket-merge-approval.md, bitbucket-branches-setup.md e recomendacoes-melhorias.md. Mantenha-o atualizado ao evoluir o projeto.
