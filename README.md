# Sistema de check-in hospitalar

Projeto manual em **NestJS + React + TypeScript**, com consulta ao cadastro externo fornecido e fila do dia em memória. A interface utiliza a imagem do Hospital Alemão Oswaldo Cruz enviada como referência, com totem de chegada e tela da recepção.

- [Abrir o totem no GitHub Pages](https://sawxor19.github.io/sistema-de-checkin/#totem)
- [Abrir a fila no GitHub Pages](https://sawxor19.github.io/sistema-de-checkin/#fila)
- [Entrega e validações](ENTREGA.md) · [Notas técnicas](notas.md) · [Enunciado original](docs/ENUNCIADO.md)

## Dois modos de execução

| Modo | Consulta de pacientes | Onde fica a fila | Quando é limpa |
| --- | --- | --- | --- |
| Local / Docker | API NestJS consulta o `mock-service` por HTTP | Memória da API, compartilhada entre clientes | Ao reiniciar a API |
| GitHub Pages / `dev:demo` | Cinco pacientes fictícios na interface | Memória de cada aba | Ao recarregar ou fechar a aba |

No Pages, use **Ver fila** e **Voltar ao totem** na mesma aba para manter os registros. O Pages é uma demonstração estática; o fluxo full stack com serviço externo pode ser avaliado executando o projeto localmente. Não utiliza PostgreSQL, armazenamento local do navegador ou serviços de nuvem adicionais.

## Rodar a aplicação completa

Pré-requisitos: **Node.js 24**, npm e Git. Execute na raiz:

```bash
git clone https://github.com/Sawxor19/sistema-de-checkin.git
cd sistema-de-checkin
npm ci
npm run setup
npm run dev
```

No PowerShell, substitua `npm` por `npm.cmd` se houver bloqueio de scripts.

Abra **http://localhost:5173/#totem**. O comando inicia o cadastro na porta **4000**, a API na **3000** e o React na **5173**. Aguarda os serviços ficarem prontos e encerra os processos iniciados por ele ao receber **Ctrl+C**. Não precisa criar arquivos `.env` para os padrões locais. Portas ocupadas são informadas sem encerrar outros serviços.

Para executar apenas a demonstração do Pages, depois da instalação:

```bash
npm run dev:demo
```

### Pacientes fictícios

| CPF | Nome |
| --- | --- |
| `11111111111` | Ana Souza |
| `22222222222` | Bruno Carvalho |
| `33333333333` | Carla Menezes |
| `44444444444` | Diego Fernandes |
| `55555555555` | Elaine Rodrigues |

O campo formata o CPF automaticamente. `99999999999` permite conferir a mensagem de paciente não encontrado. A validação exige 11 dígitos; esses exemplos não passam pela validação de dígitos verificadores de CPF.

### Fluxo da interface

1. Informe o CPF no totem pelo teclado físico ou pelos botões numéricos.
2. Clique em **Confirmar chegada**. O nome e o horário aparecem na confirmação.
3. Clique em **Ver fila de atendimento** para conferir a fila em ordem de chegada.
4. Na recepção, também é possível registrar um CPF e usar **Atualizar fila**.

A confirmação do totem é limpa após 30 segundos. O CPF é limpo após 60 segundos sem alteração. Essas limpezas não removem registros da fila. A listagem mostra apenas o dia atual em `America/Sao_Paulo`.

## Configuração e execução separada

Há exemplos em [backend/.env.example](backend/.env.example) e [frontend/.env.example](frontend/.env.example). Para executar em três terminais, após `npm run setup`, rode na raiz:

```bash
# Terminal 1
npm start --prefix mock-service
# Terminal 2
npm run start:dev --prefix backend
# Terminal 3
npm run dev --prefix frontend
```

A API lê `backend/.env` quando iniciada dentro de `backend`. O Vite lê `frontend/.env`. `VITE_API_BASE_URL` é incorporada ao build e deve ser alterada antes de compilar. Para alterar as portas pelo comando unificado, configure `API_PORT`, `MOCK_PORT` e `WEB_PORT`; ele ajusta as URLs e o CORS automaticamente. Veja exemplos em [notas.md](notas.md).

## API

| Método e rota | Resultado |
| --- | --- |
| `GET /health` | Saúde do processo, armazenamento e fuso |
| `GET /checkins` | Lista do dia em ordem de chegada |
| `POST /checkins` | Registra chegada consultando o cadastro externo |

```bash
curl -X POST http://localhost:3000/checkins -H 'Content-Type: application/json' -d '{"cpf":"11111111111"}'
```

No PowerShell:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/checkins -Method Post -ContentType 'application/json' -Body '{"cpf":"11111111111"}'
```

Detalhes do contrato e dos erros estão em [backend/README.md](backend/README.md).

## Verificação

```bash
npm run check
npx playwright install chromium
npm run test:ui
```

`check` executa lint, testes unitários, testes HTTP de integração e os builds. `test:ui` compila a versão do Pages e testa os dois modos no Chromium, com serviços isolados nas portas 3030, 4030, 5195 e 5196. Em Linux, a instalação do navegador pode exigir `npx playwright install --with-deps chromium`.

O GitHub Actions valida a entrega, inclusive os containers. A publicação do Pages usa um workflow próprio, com fila em memória na aba.

## Docker opcional

Com Docker e Compose v2 instalados, na raiz:

```bash
docker compose up --build --detach --wait
```

Abra **http://localhost:5180/#totem**. Os serviços são `mock-service`, `api` e `web`. O Nginx encaminha `/api/` à API, sem necessidade de ajustar URLs no navegador. Não existe serviço de banco de dados.

```bash
node scripts/smoke-compose.mjs
docker compose down
```

O smoke test registra um paciente fictício. Encerrar/recriar o container da API perde sua fila. As portas 3000 e 4000 devem estar livres antes de iniciar o Compose.

## Estrutura

```text
backend/           API NestJS e testes de regras/integração
frontend/          React, totem, recepção e identidade visual
mock-service/      Cadastro externo fornecido, com pacientes fictícios
scripts/           Instalação, execução, build do Pages e verificação Docker
tests/             Fluxos de navegador com Playwright
docs/ENUNCIADO.md   Enunciado original preservado
ENTREGA.md         Resultado da implementação e validações
notas.md           Decisões, configuração, limites e próximos passos
```

O código do projeto manual foi preservado e revisado. A interface e a revisão final receberam apoio de IA, conforme descrito na entrega. Dados e marca são usados nesta demonstração educacional; a aplicação não é um sistema oficial do hospital.
