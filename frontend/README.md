# Interface de check-in

React, TypeScript e Vite. Requer Node.js 24. Inclui totem (`#totem`) e recepção/fila (`#fila`), com o logo fornecido e layout responsivo.

```bash
# Dentro de frontend, com API em localhost:3000
npm ci
npm run dev
```

Abra `http://localhost:5173/#totem`. A porta é fixa; se estiver ocupada, o Vite informa o erro. O comando `npm run dev` na raiz inicia também API e cadastro.

## Fonte dos dados

- **Padrão local:** usa `VITE_API_BASE_URL`, com fallback `http://localhost:3000`.
- **Demonstração:** `VITE_DEMO_MODE=true` usa os cinco pacientes fictícios e fila em memória na aba. Recarregar limpa a fila. Os links internos mantêm os registros.

Copie [.env.example](.env.example) para `.env` se precisar personalizar. Configuração é incorporada no build; reinicie o Vite ou recompile após alterar. `VITE_BASE_PATH` é uma variável do processo, com `/` localmente e `/sistema-de-checkin/` no Pages. A imagem usa `import.meta.env.BASE_URL` para funcionar nos dois caminhos.

O totem limpa a confirmação em 30 segundos e o CPF abandonado em 60 segundos. A recepção carrega a fila ao abrir, após o registro e pelo botão de atualizar. Datas/horários são apresentados no fuso de São Paulo e os CPFs da listagem ficam parcialmente ocultos.

## Verificação

```bash
npm run lint
npm run build
```

Os testes de navegador são executados na raiz com `npm run test:ui`. Eles cobrem a aplicação integrada e a demonstração compilada para o Pages. `npm run build:pages`, também na raiz, configura o caminho e o modo de memória automaticamente.

O container usa Nginx para servir a interface e encaminhar `/api/` ao backend. Leia [README](../README.md) e [notas.md](../notas.md) para publicação, execução e diagnóstico.
