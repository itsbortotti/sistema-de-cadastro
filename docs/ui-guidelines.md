# UI/UX Guidelines — Governança Financeira de Projetos

Referência visual e de experiência para o frontend (React), alinhada ao Manual de Identidade Visual Tecnosolve e ao padrão dos projetos base.

---

## Identidade Visual

### Paleta de Cores Primárias

| Nome         | HEX       | Uso                                                    |
|--------------|-----------|--------------------------------------------------------|
| Laranja Solve| `#ff401a` | CTAs, botões primários, títulos H1                    |
| Ciano Tech   | `#02b0c6` | Links, ícones interativos, elementos tecnológicos     |
| Azul TS      | `#131b71` | Fundos escuros (sidebar/navbar), texto principal      |

### Paleta Secundária

| Nome         | HEX       |
|--------------|-----------|
| Laranja Light| `#ff8168` |
| Ciano Light  | `#87e6fb` |
| Azul Light   | `#282f7d` |
| Branco       | `#ffffff` |
| Cinza        | `#ececec` |
| Cinza Escuro | `#666666` |

### Cores Semânticas

| Nome   | HEX       |
|--------|-----------|
| Sucesso| `#2E7D32` |
| Erro   | `#ff401a` |
| Alerta | `#F9A825` |
| Info   | `#02b0c6` |

### Gradientes

- Laranja: `#ff401a` → `#ff8168`
- Ciano: `#02b0c6` → `#87e6fb`

### Regras de botões

- **Primário**: fundo Laranja Solve, texto Branco.
- **Secundário**: fundo Azul TS, texto Branco.

---

## CSS (variáveis no frontend)

As variáveis estão em `frontend/src/index.css`:

```css
:root {
  --ts-laranja: #ff401a;
  --ts-laranja-light: #ff8168;
  --ts-ciano: #02b0c6;
  --ts-ciano-light: #87e6fb;
  --ts-azul: #131b71;
  --ts-azul-light: #282f7d;
  --ts-branco: #ffffff;
  --ts-cinza: #ececec;
  --ts-cinza-escuro: #666666;
  --ts-sucesso: #2E7D32;
  --ts-erro: #ff401a;
  --ts-alerta: #F9A825;
  --ts-info: #02b0c6;
  --font-h1: 'Archivo Black', sans-serif;
  --font-body: 'Lato', sans-serif;
}
```

---

## Tipografia

| Nível  | Fonte        | Peso  | Cor (fundo claro)   |
|--------|--------------|-------|---------------------|
| H1     | Archivo Black| Black | Laranja Solve       |
| H2 / H3| Lato         | Bold  | Azul TS             |
| Body   | Lato         | Regular| Cinza Escuro / Azul TS |
| Button | Lato         | Bold  | Branco              |

Fontes carregadas em `frontend/index.html` (Google Fonts): Archivo Black, Lato.

---

## Menu

- Itens de menu em **ordem alfabética** (exceto ordenação por fluxo).
- Sidebar: fundo Azul TS; link ativo com destaque Laranja Solve.

---

## Acentuação

Todas as mensagens ao usuário em **português com acentuação correta** (erros, validações, labels).

Exemplos: inválido, válido, código, usuário, obrigatório, verificação.

---

## Tratamento de erros

1. Todo erro deve ser exibido ao usuário (inline, dialog ou toast).
2. Mensagens em português, compreensíveis, sem jargão técnico.
3. Loading deve ser desligado antes de tratar erro.

### Mensagens padrão (frontend `api/client.js`)

| Situação      | Mensagem                                                                 |
|---------------|--------------------------------------------------------------------------|
| 401           | "Sua sessão expirou. Faça login novamente."                             |
| 403           | "Você não tem permissão para realizar esta ação."                       |
| 404           | "O registro solicitado não foi encontrado."                             |
| 500           | "Ocorreu um erro inesperado. Tente novamente."                           |
| Sem conexão   | "Não foi possível conectar ao servidor. Verifique sua conexão."         |
| Login inválido| "Login ou senha inválidos."                                             |
| Erro ao carregar | "Erro ao carregar dados. Tente novamente."                            |

---

## Testes

- **Execução**: `cd frontend && npm run test` (interativo) ou `npm run test:run` (CI).
- **Stack**: Vitest + React Testing Library + jsdom.
- **Escopo**: fluxos críticos (ex.: login), tratamento de erros (ex.: client API), componentes reutilizáveis quando fizer sentido.
- **Setup**: `frontend/src/test/setup.js`; testes em `frontend/src/**/*.test.jsx` ou `*.spec.js`.

---

## Referências

- [api-standards.md](api-standards.md) — Padrões da API e mensagens de erro (backend).
- [backend.md](backend.md) — Estrutura e execução do backend.
- Manual de Identidade Visual Tecnosolve v2.
- Projeto base: `docs/ui-guidelines.md` nos projetos padrão Tecnosolve (novos-projetos).
