# Mock Service — Cadastro de Pacientes

Serviço externo simulado que a sua API deve **consumir** durante o check-in.
Você não precisa alterar este serviço.

## Como rodar (sem Docker)

```bash
cd mock-service
npm ci
npm start
```

O serviço sobe em `http://localhost:4000`.

Requer Node.js 24. A variável `PORT` altera a porta (padrão `4000`). O comando
`npm run dev` na raiz inicia este serviço junto com a API e a interface.
No PowerShell, use `npm.cmd` se a política de execução bloquear `npm.ps1`.

## Endpoints

### `GET /health`
Retorna `{ "status": "ok" }`.

### `GET /pacientes/:cpf`
Retorna os dados do paciente a partir do CPF (somente dígitos).

**200 — encontrado**
```json
{ "cpf": "11111111111", "nome": "Ana Souza", "dataNascimento": "1988-03-12" }
```

**404 — não encontrado**
```json
{ "erro": "Paciente não encontrado" }
```

## CPFs de teste

| CPF           | Paciente          |
|---------------|-------------------|
| 11111111111   | Ana Souza         |
| 22222222222   | Bruno Carvalho    |
| 33333333333   | Carla Menezes     |
| 44444444444   | Diego Fernandes   |
| 55555555555   | Elaine Rodrigues  |

Qualquer outro CPF retorna 404.
