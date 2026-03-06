# Governança Financeira de Projetos

Aplicação para gestão de portfólio com login, menu lateral e cadastros de usuários, projetos, Capex/Opex e demais módulos. **Backend** em Node.js (Express) com APIs documentadas no Swagger; **frontend** em React (Vite). Persistência em **PostgreSQL** com **Prisma** (migrations e seed).

---

## Como executar

### Pré-requisitos

- **Node.js** (versão LTS recomendada)
- **PostgreSQL** instalado e em execução (porta 5432)

### Ordem dos passos

1. Instalar dependências (backend e frontend)
2. Configurar variáveis de ambiente e criar o banco
3. Aplicar as migrations
4. Popular o banco (seed)
5. Iniciar backend e frontend

---

### 1. Instalar dependências

**Backend:**

```bash
cd backend
npm install
```

O script `postinstall` roda `prisma generate` automaticamente (gera o cliente Prisma).

**Frontend** (em outro terminal ou depois):

```bash
cd frontend
npm install
```

---

### 2. Configurar o banco (backend)

Crie o arquivo `.env` na pasta `backend`:

```bash
cd backend
cp .env.example .env
```

Edite o `.env` e defina a connection string do PostgreSQL. Exemplo:

```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/gestao_portfolio?schema=public"
PORT=3001
SESSION_SECRET=sistema-cadastro-secret
```

Crie o banco no PostgreSQL (se ainda não existir):

```sql
CREATE DATABASE gestao_portfolio;
```

(No `psql` ou em um cliente como DataGrip/DBeaver.)

---

### 3. Aplicar as migrations

As migrations criam/atualizam as tabelas no banco (Usuario, Perfil, Permissao, Log, Empresa, Projeto, Capex, etc.):

```bash
cd backend
npx prisma migrate deploy
```

Em **desenvolvimento**, ao alterar o `schema.prisma` e criar uma nova migration:

```bash
npx prisma migrate dev --name nome_da_mudanca
```

---

### 4. Popular o banco (dados iniciais)

**Banco novo (recomendado):** rode o seed para criar o usuário admin, perfis padrão (Administrador, Membro, Apenas visualização), permissões e dados iniciais (hospedagens, formas de acesso):

```bash
cd backend
npm run db:seed
```

**Se você tiver backup dos JSON antigos** em `backend/data/` (ex.: `usuarios.json`, `permissoes.json`), coloque os arquivos lá e rode uma vez:

```bash
npm run db:import
```

Depois pode remover os JSON; a aplicação usa apenas o PostgreSQL.

**Problema com login do admin?** Para garantir que o usuário admin exista com senha `admin`:

```bash
node scripts/reset-admin.js
```

---

### 5. Subir o backend

Na pasta `backend`:

```bash
cd backend
npm start
```

- **API:** http://localhost:3001  
- **Swagger:** http://localhost:3001/api-docs  

---

### 6. Subir o frontend

Em **outro terminal**, na pasta `frontend`:

```bash
cd frontend
npm run dev
```

- **Aplicação:** http://localhost:5173 (ou a porta que o Vite indicar, ex.: 5174)

---

### 7. Acessar o sistema

Abra no navegador a URL do frontend (ex.: **http://localhost:5173**) e faça login:

| Campo    | Valor   |
|----------|---------|
| Usuário  | `admin` |
| Senha    | `admin` |

---

## Estrutura do projeto

```
gestao_portfolio/
├── backend/          # API Node.js (Express)
├── frontend/         # Aplicação React (Vite)
├── docs/             # Documentação unificada (padrão do projeto e prompt para IA)
├── .gitignore
└── README.md
```

### Backend (`backend/`)

API REST com autenticação por sessão (cookie), CORS e Swagger. Persistência em **PostgreSQL** com **Prisma** (ORM e migrations).

| Pasta/Arquivo   | Descrição |
|-----------------|-----------|
| `server.js`     | Aplicação Express: CORS, sessão, montagem das rotas, Swagger |
| `lib/prisma.js` | Cliente Prisma (singleton) |
| `prisma/`       | `schema.prisma` (modelos), `migrations/` (migrations versionadas), `seed.js` (dados iniciais), `import-from-json.js` (importação única de JSON) |
| `middleware/`   | `permissoes.js` — `requireAuth`, `requirePermissaoPorMetodo` para rotas protegidas por perfil |
| `routes/`       | Rotas por recurso: `auth`, `usuarios`, `projetos`, `capex`, `fornecedores`, `areas`, `hospedagens`, `formasAcesso`, `times`, `produtosSoftware`, `empresas`, `permissoes`, `perfis`, `logs` |
| `data/`         | Camada de dados com Prisma (usuários, perfis, permissões, projetos, capex, logs, etc.) |
| `lib/`          | `prisma.js` (cliente), `logHelper.js` (registro de logs do sistema) |
| `config/`       | Configuração centralizada (`index.js`, `constants.js`) e variáveis de ambiente |
| `validators/`   | Validação com express-validator (auth, usuarios, common) |
| `scripts/`      | `reset-admin.js` (garante admin com senha `admin`) |
| `test/`         | Testes unitários (Jest): `data/`, `lib/`, `middleware/`, `routes/` |
| `package.json`  | Scripts: `npm start`, `npm test`, `npm run db:migrate`, `npm run db:seed`, `npm run db:studio`, `npm run db:import` |

- **Porta:** 3001  
- **Variáveis de ambiente:** `DATABASE_URL`, `PORT`, `SESSION_SECRET` (ver [docs/PADRAO-PROJETO-IA.md](docs/PADRAO-PROJETO-IA.md))

### Frontend (`frontend/`)

Interface em React com React Router, menu lateral e telas de listagem/cadastro.

| Pasta/Arquivo   | Descrição |
|-----------------|-----------|
| `src/App.jsx`   | Rotas e layout principal (rotas privadas, redirects) |
| `src/main.jsx`  | Ponto de entrada e providers (Auth, Permissões, Tema) |
| `src/components/` | `Layout` (menu lateral), `ConfigColunasModal`, `AcoesListagem`, `ErrorBoundary` |
| `src/context/`  | `AuthContext`, `PermissoesContext`, `ThemeContext` |
| `src/pages/`    | Telas: Login, Dashboard, e por módulo (usuários, projetos, capex, fornecedores, áreas, hospedagens, formas de acesso, times, produtos de software, empresas) — listagem + formulário |
| `src/api/`      | Cliente HTTP para chamadas à API (proxy `/api` no Vite) |
| `src/hooks/`    | Ex.: `useListColumns` para colunas configuráveis |
| `index.html`    | HTML raiz (Vite) |
| `vite.config.js`| Configuração Vite (proxy para o backend em desenvolvimento) |
| `package.json`  | Dependências (React, React Router, Recharts, Vitest, etc.) |

- **Porta:** 5173  
- **Scripts:** `npm run dev` (desenvolvimento), `npm run build`, `npm run test` / `npm run test:run`

### Documentação (`docs/`)

| Documento | Conteúdo |
|-----------|----------|
| [docs/PADRAO-PROJETO-IA.md](docs/PADRAO-PROJETO-IA.md) | **Documento unificado:** arquitetura, API, UI, segurança, CI/CD e instruções para uso como prompt em ferramentas de IA. Substitui backend, api-standards, ui-guidelines e docs do Bitbucket. |

---

## APIs (resumo)

Documentação interativa: **http://localhost:3001/api-docs**

- **Auth:** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/sessao`
- **Usuários:** `GET/POST /api/usuarios`, `GET/PUT/DELETE /api/usuarios/:id`
- **Projetos, Capex, Fornecedores, Áreas, Hospedagens, Formas de Acesso, Times, Produtos de Software, Empresas:** CRUD análogo
- **Permissões:** `GET /api/permissoes/me` (permissões do usuário logado)
- **Perfis:** CRUD em `/api/perfis`; matriz de permissões por perfil
- **Logs:** `GET /api/logs` (logs do sistema: login, edições, etc.)

A autenticação usa sessão (cookie). O frontend usa proxy para `/api` no Vite, então as requisições partem da mesma origem e enviam o cookie. Detalhes de erros, status HTTP, segurança e padrões em [docs/PADRAO-PROJETO-IA.md](docs/PADRAO-PROJETO-IA.md).
