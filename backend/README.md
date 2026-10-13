# API de check-in

NestJS e TypeScript, com armazenamento em memória e integração HTTP com o cadastro externo. Requer Node.js 24.

```bash
# Dentro de backend, com o cadastro já iniciado em localhost:4000
npm ci
npm run start:dev
```

A execução completa pode ser iniciada com `npm run dev` na raiz. A API lê `.env` do diretório de execução; copie [.env.example](.env.example) para configurar porta, cadastro, timeout e CORS. Os padrões locais dispensam esse arquivo.

## Contrato

`POST /checkins` recebe `{ "cpf": "11111111111" }` e retorna **201**:

```json
{
  "cpf": "11111111111",
  "nome": "Ana Souza",
  "horarioChegada": "2026-10-12T15:00:00.000Z"
}
```

O horário acima é ilustrativo. CPF deve ser string de 11 dígitos sem pontuação. A API consulta o cadastro antes de armazenar; não valida dígitos verificadores e permite duplicatas.

`GET /checkins` retorna **200** com um array desses registros, filtrado pelo dia de `America/Sao_Paulo` e ordenado pelo horário de chegada. A fila inicia vazia e é perdida quando o processo reinicia.

| Status no POST | Causa |
| --- | --- |
| `400` | CPF ausente ou formato inválido |
| `404` | Paciente não encontrado no cadastro |
| `502` | Erro HTTP do cadastro, JSON ou nome inválido |
| `503` | Indisponibilidade ou timeout do cadastro |

Erros usam o formato NestJS com `statusCode`, `message` e `error`.

`GET /health` retorna `{ "status": "ok", "storage": "memory", "timezone": "America/Sao_Paulo" }`; verifica o processo da API, sem consultar o cadastro. `GET /` apresenta o nome do serviço e as rotas principais.

## Verificar e compilar

```bash
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
npm run start:prod
```

Testes unitários cobrem os componentes e a configuração. Os testes de integração sobem um cadastro HTTP controlado e verificam sucesso, falhas, timeout, formato, CORS, concorrência e fuso horário. O build gera `dist/main.js`.

O [Compose na raiz](../docker-compose.yml) também executa esta API e o cadastro. Veja a [entrega](../ENTREGA.md) para as limitações e os resultados de validação.
