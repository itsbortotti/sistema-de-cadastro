# Sistema de Cadastro

Aplicação com login, menu lateral e cadastro de usuários. Backend em Node.js com APIs documentadas no Swagger e frontend em React.

## Estrutura

- **backend/** – API Node/Express com Swagger (porta 3001)
- **frontend/** – React (Vite) com login, menu lateral e cadastro de usuários (porta 5173)

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

- **POST /api/auth/login** – Login (login, senha)
- **POST /api/auth/logout** – Logout
- **GET /api/auth/sessao** – Retorna usuário da sessão
- **GET /api/usuarios** – Lista usuários
- **GET /api/usuarios/:id** – Busca usuário
- **POST /api/usuarios** – Cria usuário
- **PUT /api/usuarios/:id** – Atualiza usuário
- **DELETE /api/usuarios/:id** – Remove usuário

A autenticação usa sessão (cookie). O frontend está configurado com proxy para `/api` no Vite, então as chamadas usam a mesma origem e enviam o cookie.
