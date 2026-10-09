# Entrega — [Victor Hugo Sanches]

> Preencha este arquivo. Ele nos ajuda a rodar e entender o seu projeto.

## Como rodar
_Passo a passo para subir o back-end e o front-end na minha máquina._

provavelmente npm start pro front e npm run dev pro back

## O que foi feito
_Resumo do que está funcionando._



## Onde guardei os dados
_Usei banco de dados ou memória? Por quê?_

vou usar SQLite.

## Decisões e dificuldades
_Escolhas que fiz e pontos onde tive dúvida ou dificuldade._



## O que faria com mais tempo
_Próximos passos ou melhorias que ficaram de fora._



## SEÇÃO EXTRA: 
_Como eu entendi o projeto e como eu vou estruturar minha linha de raciocínio durante o desenvolvimento._

1. Bom, eu devo ter demorado aproximadamente uns 30 minutos pra ler o projeto e o que deu pra entender:
a. Sistema de fila de recepção de clínica hospitalar;
b. Construir uma interface com React e TypeScript para inserir o CPF e ter um retorno de sucesso, ou, se o CPF não existir no banco, interface de erro dizendo que não foi possível encontrar o CPF no banco (CPF inexistente);
c. APIs em Node e TS usando Nest com dois endpoints para: criar o check-in e listar uma fila de cpfs cadastrados na recepção;
d. consumir mock-service para consultar o banco e retornar com nome do paciente ou erro de cpf inexistente;
e. é opcional utilizar um banco, masssssssss, vou usar SQLite.
f. também vou tentar entregar o docker-compose (se der tempo, mas acredito que dê)
(editado pela primeira vez, 06:06h - 09/10/2026)

2. Banco de dados e saúde do sistema está dando ok.
a. já retornei os endpoints que estão salvos em /pacientes, estão ok
b. dei uma olhada na documentação do NestJS pra criar o backend
c. criando o backend com CJS (CommonJS)
d. criado o backend:

 [06:30:16] Starting compilation in watch mode...

[06:30:18] Found 0 errors. Watching for file changes.

[Nest] 24256  - 09/10/2026, 06:30:19     LOG [NestFactory] Starting Nest application...
[Nest] 24256  - 09/10/2026, 06:30:19     LOG [InstanceLoader] AppModule dependencies initialized +7ms
[Nest] 24256  - 09/10/2026, 06:30:19     LOG [RoutesResolver] AppController {/}: +8ms
[Nest] 24256  - 09/10/2026, 06:30:19     LOG [RouterExplorer] Mapped {/, GET} route +2ms
[Nest] 24256  - 09/10/2026, 06:30:19     LOG [NestApplication] Nest application successfully started +2ms

e. criei o módulo:

CREATE src/checkins/checkins.module.ts (89 bytes)
UPDATE src/app.module.ts (334 bytes)

f. criei o controller:

CREATE src/checkins/checkins.controller.ts (109 bytes)
CREATE src/checkins/checkins.controller.spec.ts (524 bytes)
UPDATE src/checkins/checkins.module.ts (186 bytes)

g. criei o service: 

CREATE src/checkins/checkins.service.ts (96 bytes)
CREATE src/checkins/checkins.service.spec.ts (492 bytes)
UPDATE src/checkins/checkins.module.ts (272 bytes)

3. Agora, começar os endpoints, mas antes, tomar café da manhã e me arrumar pra ir trabalhar daqui a pouco. Volto provavelmente a noite.
(editado pela segunda vez, 06:38h - 09/10/2026)