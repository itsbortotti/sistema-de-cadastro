# Governança Financeira de Projetos

Aplicação com login, menu lateral e cadastro de usuários, projetos, Capex/Opex e demais módulos. Backend em Node.js com APIs documentadas no Swagger e frontend em React.

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [docs/backend.md](docs/backend.md) | Estrutura do backend, como rodar, variáveis de ambiente |
| [docs/api-standards.md](docs/api-standards.md) | Padrões da API: erros, status HTTP, mensagens em PT-BR |
| [docs/ui-guidelines.md](docs/ui-guidelines.md) | Identidade visual, cores, tipografia, mensagens ao usuário, testes do frontend |

## Estrutura

- **backend/** – API Node/Express com Swagger (porta 3001)
- **frontend/** – React (Vite) com login, menu lateral e cadastro de usuários (porta 5173)
- **docs/** – Documentação do projeto (backend, API, UI)

## Como rodar

### 1. Instalar dependências

Na raiz do projeto:

```bash
npm install
```

No frontend:

```bash
cd frontend && npm install
```

### 2. Subir o backend

Na raiz:

```bash
npm start
```

O servidor sobe em `http://localhost:3001`.  
Documentação das APIs: **http://localhost:3001/api-docs**

### 3. Subir o frontend

Em outro terminal, na pasta `frontend`:

```bash
npm run dev
```

Acesse: **http://localhost:5173**

### Login padrão

- **Usuário:** `admin`  
- **Senha:** `admin`

## APIs (Swagger)

Documentação interativa: **http://localhost:3001/api-docs**

- **POST /api/auth/login** – Login (login, senha)
- **POST /api/auth/logout** – Logout
- **GET /api/auth/sessao** – Retorna usuário da sessão
- **GET /api/usuarios** – Lista usuários
- **GET /api/usuarios/:id** – Busca usuário
- **POST /api/usuarios** – Cria usuário
- **PUT /api/usuarios/:id** – Atualiza usuário
- **DELETE /api/usuarios/:id** – Remove usuário
- … demais recursos: projetos, capex, produtos-software, fornecedores, áreas, hospedagens, formas-acesso, times, empresas, permissões.

A autenticação usa sessão (cookie). O frontend está configurado com proxy para `/api` no Vite, então as chamadas usam a mesma origem e enviam o cookie. Padrões de erro e status HTTP estão em [docs/api-standards.md](docs/api-standards.md).
