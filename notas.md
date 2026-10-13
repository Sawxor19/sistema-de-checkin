# Notas técnicas e operacionais

## Escopo final

A entrega contém um único projeto: backend manual NestJS, interface React com totem e fila, e cadastro externo simulado. A versão de vibecoding foi removida. O [enunciado](docs/ENUNCIADO.md) foi preservado e as instruções atuais estão no [README](README.md) e na [entrega](ENTREGA.md).

## Memória e reset da fila

| Execução | Como resetar | Compartilhamento |
| --- | --- | --- |
| GitHub Pages / `dev:demo` | Recarregar a página | Somente na mesma aba |
| API local | Encerrar e reiniciar a API | Todos os clientes da mesma API |
| Docker | `docker compose restart api` | Todos os clientes do container da API |

Não há endpoint de exclusão nem persistência em `localStorage`. A limpeza automática da confirmação no totem não reseta a fila. Abrir a recepção em outra aba do Pages inicia outra fila, por isso a navegação usa hashes na mesma aba.

## Variáveis

| Variável | Padrão | Uso |
| --- | --- | --- |
| `PORT` | `3000` API / `4000` mock | Porta do serviço executado separadamente |
| `CADASTRO_URL` | `http://localhost:4000` | URL HTTP/HTTPS do cadastro, sem query, fragmento ou credenciais |
| `CADASTRO_TIMEOUT_MS` | `5000` | Limite de consulta ao cadastro, de 1 a 30000 ms |
| `FRONTEND_ORIGIN` | `http://localhost:5173,http://127.0.0.1:5173` | Origens CORS separadas por vírgula, sem caminho |
| `VITE_API_BASE_URL` | `http://localhost:3000` local | URL da API incorporada no frontend |
| `VITE_DEMO_MODE` | `false` local | `true` habilita memória na aba |
| `VITE_HOSTED` | `false` local | Evita o fallback para localhost quando publicado |
| `VITE_BASE_PATH` | `/` | Caminho público do Vite; Pages usa `/sistema-de-checkin/` |

Para executar separadamente, copie `.env.example` para `.env` em `backend` ou `frontend`. O backend lê `.env` do diretório onde é iniciado; o Vite lê os arquivos de ambiente do frontend. Variáveis de ambiente já definidas no processo têm precedência. Não use segredos em variáveis `VITE_*`, pois fazem parte da interface pública.

`VITE_BASE_PATH` deve ser definido no ambiente do processo que executa o Vite, como faz o script `build:pages`. Variáveis do frontend exigem reiniciar o servidor ou recompilar. O Compose ignora arquivos `.env` internos e configura os endereços necessários nos containers.

O comando unificado `npm run dev` configura URLs locais e CORS a partir de suas próprias portas. Para personalizar no PowerShell:

```powershell
$env:API_PORT = '3031'
$env:MOCK_PORT = '4031'
$env:WEB_PORT = '5174'
npm.cmd run dev
```

Essas variáveis valem para a sessão do terminal. O comando unificado ajusta o modo de dados e as URLs, mesmo que existam `.env` com outra configuração; use a execução separada para integrar um cadastro/API diferente.

## Tratamento de erros

A API registra a chegada apenas depois de obter um nome válido. CPF inválido retorna `400`; inexistente, `404`; resposta inválida do cadastro, `502`; conexão interrompida ou consulta excedida, `503`. A interface valida a estrutura recebida antes de renderizar a fila e limita a espera pela API a 8 segundos. Cancelamentos ao sair da recepção não exibem erro de conexão.

## Diagnóstico

- **Porta ocupada:** encerre a execução anterior pelo terminal ou configure outras portas. O script não mata processos externos.
- **Paciente não encontrado:** utilize um dos cinco CPFs da tabela do README. CPF válido em formato não significa paciente cadastrado.
- **Serviço indisponível no modo local:** verifique `http://localhost:4000/health` e `http://localhost:3000/health`, além das mensagens do terminal.
- **Fila diferente em duas abas do Pages:** comportamento esperado; registre e consulte usando os links internos na mesma aba.
- **Fila vazia após recarregar:** esperado no Pages. No modo API, verifique se o processo reiniciou ou se mudou o dia de São Paulo.
- **Imagem/assets não carregam no Pages:** confira o caminho base e execute `npm run build:pages`. A imagem é servida de `frontend/public/haoc-logo.png`.
- **Erro de npm no PowerShell:** use `npm.cmd` e `npx.cmd`.
- **Falha ao abrir o navegador de teste:** execute `npx playwright install chromium`; no Linux, use `--with-deps`.
- **Compose não inicia:** verifique Docker, portas 3000/4000/5180 e `docker compose logs`. O serviço `web` precisa resolver o nome `api` na rede do Compose.

## Publicação e testes

O workflow do Pages publica apenas a interface em modo de demonstração. O workflow de validação executa lint, builds, testes da API, testes de navegador e verificação do Compose. Os testes de interface iniciam serviços próprios em portas separadas, sem utilizar a fila local nas portas padrão.

O comando `npm run test:ui` deixa `frontend/dist` compilado para o Pages. Para um build local padrão, execute `npm run build`. Para visualizar o build do Pages localmente no PowerShell:

```powershell
npm.cmd run build:pages
$env:VITE_BASE_PATH = '/sistema-de-checkin/'
npm.cmd run preview --prefix frontend
```

Abra `http://localhost:4173/sistema-de-checkin/#totem`.

## Evolução prevista

Persistência, regras de duplicidade, autenticação, acesso restrito à recepção, atualizações em tempo real e filas de triagem/consultório são melhorias futuras. Elas não estão implementadas nesta entrega. O uso real precisaria também de requisitos de privacidade, retenção e disponibilidade definidos pela instituição.

## Dependências

Na revisão, `npm audit --omit=dev` do backend não apontou vulnerabilidades de produção. O frontend e o cadastro também tiveram auditoria sem ocorrências. A árvore de testes Jest/ts-jest do backend apresentou 20 ocorrências moderadas relacionadas à dependência transitiva `sprintf-js`; o comando automático sugeria versões anteriores incompatíveis das ferramentas de teste. Não foi aplicado `audit fix --force`. Essa pendência fica restrita às dependências de desenvolvimento e deve ser reavaliada quando houver uma atualização compatível.
