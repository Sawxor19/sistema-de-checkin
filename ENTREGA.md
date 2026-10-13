# Entrega — Sistema de check-in hospitalar

**Candidato:** Victor Hugo Sanches

**Stack:** NestJS, Node.js, TypeScript, React e Vite

**Repositório:** [Sawxor19/sistema-de-checkin](https://github.com/Sawxor19/sistema-de-checkin)

## Acessar e executar

O [totem publicado](https://sawxor19.github.io/sistema-de-checkin/#totem) permite experimentar o registro e acessar a [fila](https://sawxor19.github.io/sistema-de-checkin/#fila). No Pages, a fila fica na memória da aba e é limpa ao recarregar. A demonstração utiliza cinco pacientes fictícios e dispensa API hospedada.

Para avaliar a integração full stack com o serviço externo, use **Node.js 24** e execute na raiz:

```bash
npm ci
npm run setup
npm run dev
```

Abra **http://localhost:5173/#totem** e teste com `11111111111`. No PowerShell, `npm.cmd` funciona quando `npm.ps1` está bloqueado. O [README](README.md) contém os passos de clone, execução separada, configuração, testes e Docker.

## O que foi implementado

- API REST com `CheckinsModule`, `CheckinsController` e `CheckinsService`.
- `POST /checkins`: valida CPF, consulta `GET /pacientes/:cpf` no cadastro externo e armazena nome, CPF e horário de chegada.
- `GET /checkins`: retorna apenas o dia atual de São Paulo, ordenado por horário; datas armazenadas em ISO 8601 UTC.
- `GET /health`: permite verificar a disponibilidade do processo da API.
- Integração com timeout configurável, tratamento de paciente inexistente, indisponibilidade, JSON malformado e nome inválido.
- Totem com máscara de CPF, teclado numérico, apagar/limpar, bloqueio durante o envio e confirmação temporária.
- Recepção com registro, fila, CPF parcialmente oculto, atualização e mensagens de carregamento/erro.
- Interface responsiva usando o logo fornecido; navegação entre totem e fila na mesma aba.
- Configuração por ambiente, comando unificado de instalação/execução, testes automatizados e workflows de validação/publicação.
- Docker Compose opcional com cadastro, API e interface servida pelo Nginx.

## Integração e persistência

Na execução local, o React envia `{ "cpf": "11111111111" }` ao NestJS. A API consulta o `mock-service` por HTTP e só registra a chegada quando recebe um nome válido. A fila está na memória do `CheckinsService`, é compartilhada entre clientes da mesma API e desaparece ao reiniciar o processo. Essa escolha é permitida pelo enunciado e mantém a entrega pequena.

No Pages, `VITE_DEMO_MODE=true` troca a fonte de dados por memória no módulo da interface. Não há chamadas HTTP de cadastro ou API nesse modo. Cada aba possui uma fila independente. Usar os links internos mantém a fila; recarregar limpa os registros. Esse modo demonstra a interface, enquanto a execução local comprova o consumo do serviço externo.

## Validação reproduzível

```bash
npm run check
npx playwright install chromium
npm run test:ui
```

Resultados da revisão da entrega:

| Verificação | Resultado |
| --- | --- |
| Lint do backend e frontend | Aprovado |
| Testes unitários/configuração | 9 aprovados, em 3 suítes |
| Testes de integração HTTP da API | 22 aprovados, em 1 suíte |
| Build do backend e frontend | Aprovado |
| Playwright: aplicação completa e Pages | 6 cenários aprovados |

Os testes HTTP verificam validação de CPF, consumo do cadastro, falhas 404/502/503, timeout dos cabeçalhos e do corpo, duplicatas concorrentes, ordenação, fuso horário e CORS. Os testes de navegador verificam registro pelo totem e recepção, compartilhamento pela API, memória isolada no Pages, recarregamento, navegação, teclado, tempos de limpeza, erros da API e apresentação em celular.

O workflow [Validar entrega](.github/workflows/checks.yml) executa esses comandos e também sobe o Compose e verifica interface, imagem, proxy `/api`, cadastro e fila. Docker não estava instalado no ambiente Windows da revisão; a validação dos containers é executada no runner Linux do GitHub Actions.

## Decisões e limites

- A validação de CPF exige uma string de 11 dígitos. Não valida dígitos verificadores, preservando os CPFs fictícios fornecidos.
- Check-ins repetidos do mesmo CPF são permitidos. Não foi definida uma regra de bloqueio no desafio.
- A fila é consultada ao abrir a recepção, depois do registro e pelo botão de atualizar; não há atualização contínua entre telas.
- O horário de chegada corresponde à conclusão da consulta ao cadastro, quando o registro é efetivamente criado.
- Os registros de dias anteriores ficam em memória até o reinício, mas são excluídos da listagem do dia.
- `GET /health` verifica a API, sem garantir que o cadastro externo esteja saudável.
- A entrega cobre chegada e fila da recepção. Não inclui chamada de senhas, triagem, consultório, farmácia, autenticação ou persistência durável.
- A ocultação parcial de CPF na interface não constitui controle de acesso; esta versão usa somente dados fictícios.

## Autoria e revisão

O projeto manual e a integração inicial foram desenvolvidos pelo candidato. A interface visual, o totem, a demonstração do Pages e a revisão final de código, documentação, testes e configuração receberam apoio de IA. A versão separada de vibecoding não faz parte desta entrega.

O histórico de `main` foi consolidado em um único commit final por solicitação do autor. Um backup do histórico anterior foi guardado localmente fora do repositório.

## Próximos passos

Uma evolução para uso real exigiria definir regras de duplicidade e retenção, adicionar persistência e autenticação, restringir exposição de dados e implementar chamadas/status de atendimento. A consulta contínua da fila e novas etapas assistenciais podem ser acrescentadas após definir o fluxo. As decisões e instruções de diagnóstico estão em [notas.md](notas.md).
