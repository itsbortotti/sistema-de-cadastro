# Padrões da API — Backend (Node.js/Express)

Referência para respostas de erro, status HTTP e mensagens ao usuário. Alinhado ao [ui-guidelines](ui-guidelines.md) e ao padrão dos projetos base Tecnosolve.

---

## Formato de erro

Todas as respostas de erro da API usam o campo **`erro`** com mensagem em português (PT-BR, acentuado).

### Exemplo

```json
{
  "erro": "O registro solicitado não foi encontrado."
}
```

### Regras

- **SEMPRE** usar a propriedade `erro` (não `message` nem `detail`) para compatibilidade com o frontend.
- Mensagens em **português**, com acentuação correta (obrigatório, inválido, usuário, etc.).
- Mensagens **compreensíveis** para o usuário final, sem jargão técnico.

---

## Status HTTP e mensagens padrão

| Status | Situação              | Mensagem (exemplo / padrão) |
|--------|------------------------|-----------------------------|
| 400    | Validação / dados inválidos | Mensagem específica (ex.: "Nome é obrigatório", "Login e senha são obrigatórios") |
| 401    | Não autenticado       | "Não autenticado" |
| 401    | Login inválido        | "Login ou senha inválidos" |
| 403    | Sem permissão         | "Você não tem permissão para realizar esta ação." |
| 404    | Recurso não encontrado| "Não encontrado" ou "O registro solicitado não foi encontrado." / "Usuário não encontrado" (quando aplicável) |
| 500    | Erro interno          | "Ocorreu um erro inesperado. Tente novamente." (evitar expor detalhes) |

O **frontend** mapeia 401, 403, 404 e 500 para mensagens padrão definidas em `frontend/src/api/client.js`. O backend pode enviar texto alternativo em `erro`; o client só substitui quando não há mensagem ou quando se usa o status para escolher a mensagem padrão.

---

## Convenções de sucesso

| Método   | Ação        | Status recomendado | Body |
|----------|-------------|---------------------|------|
| GET      | Listar      | 200                 | Array ou objeto com lista |
| GET      | Buscar por id | 200               | Objeto do recurso |
| POST     | Criar       | 201 (recomendado) ou 200 | Recurso criado |
| PUT/PATCH| Atualizar   | 200                 | Recurso atualizado |
| DELETE   | Remover     | 204 sem body (recomendado) ou 200 | — |

O backend atual pode retornar 200 em POST e DELETE; novos endpoints devem preferir **201** em criação e **204** em exclusão.

---

## Autenticação

- Autenticação por **sessão** (cookie `connect.sid`).
- Rotas protegidas: middleware `requireAuth` (retorna 401 se não houver sessão).
- Permissões por entidade: `requirePermissaoPorMetodo('entidade')` (retorna 403 se o tipo do usuário não tiver permissão).

---

## Documentação interativa

- **Swagger UI**: `http://localhost:3001/api-docs`
- Definições nos arquivos em `backend/routes/*.js` via JSDoc `@swagger`.

---

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/login | Login (body: login, senha) |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/sessao | Usuário da sessão atual |
| GET/POST | /api/usuarios | Listar / criar usuários |
| GET/PUT/DELETE | /api/usuarios/:id | Buscar / atualizar / remover usuário |
| GET/PUT | /api/permissoes | Listar / salvar regras de permissão |
| GET/POST | /api/projetos | Listar / criar projetos |
| GET/POST | /api/capex | Listar / criar Capex e Opex |
| GET/POST | /api/produtos-software | Listar / criar sistemas |
| … | … | Demais recursos: fornecedores, áreas, hospedagens, formas-acesso, times, empresas |

Lista completa em **http://localhost:3001/api-docs**.

---

## Referências

- [ui-guidelines.md](ui-guidelines.md) — Mensagens de erro ao usuário e tratamento no frontend.
- [backend.md](backend.md) — Estrutura do backend, como rodar e variáveis de ambiente.
- Projeto base Tecnosolve: `docs/api-standards.md` (FastAPI/Python).
