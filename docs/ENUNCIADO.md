# Desafio Técnico — Desenvolvedor Júnior (Full Stack)

Olá! Este desafio faz parte do nosso processo seletivo. O objetivo **não** é acertar
tudo nem impressionar com complexidade — queremos entender como você pensa, organiza
o código e comunica o que fez. Um projeto pequeno, funcional e bem explicado é
exatamente o que procuramos.

**Tempo estimado:** 3 a 6 horas. Não tem problema não terminar tudo — entregue bem
feito o que der tempo e conte no `ENTREGA.md` o que ficaria pendente.

Fique à vontade para pesquisar, consultar documentação e usar as ferramentas do seu
dia a dia. Só pedimos que você **entenda** o que entregou (podemos conversar sobre o
código na etapa seguinte).

---

## O problema

Você vai construir um pequeno sistema de **check-in de pacientes**, parecido com o
totem da recepção de um hospital.

O fluxo é simples:

1. O paciente informa o CPF no check-in.
2. O sistema consulta um serviço externo de cadastro (já fornecido neste repositório,
   em `mock-service`) para trazer o **nome** do paciente.
3. O check-in é registrado em uma fila, com horário de chegada.
4. A recepção consegue **ver a fila** de check-ins do dia.

---

## Escopo mínimo (o que esperamos)

### Back-end (obrigatório)
- API REST em **Node.js + TypeScript** usando **NestJS**.
- Dois endpoints:
  - **criar check-in** (recebe o CPF, consulta o cadastro e registra na fila);
  - **listar a fila** de check-ins.
- Ao criar o check-in, **consumir o serviço externo** (`mock-service`) para obter o
  nome do paciente a partir do CPF.
- Se o CPF não existir no cadastro, retornar uma resposta de erro clara.

> Sobre persistência: pode usar um **banco de dados** (ex.: PostgreSQL) ou, se preferir
> começar simples, **guardar em memória** enquanto a aplicação roda. Banco é um plus,
> mas não é obrigatório para o júnior. Diga no `ENTREGA.md` qual caminho escolheu.

### Front-end (obrigatório, pode ser bem simples)
- Aplicação em **React**.
- Uma tela para digitar o CPF e fazer o check-in.
- Uma lista mostrando a fila de check-ins.
- Não precisa ser bonito — precisa funcionar e ser fácil de entender.

### Documentação (obrigatório)
- Preencher o `ENTREGA.md`: como rodar o projeto e um resumo do que você fez.

---

## Desejáveis (opcionais — só se sobrar tempo)

Não se cobre por isso. Se fizer, ótimo; se não, sem problema.

- Subir o projeto com **Docker** (`docker compose up`). O `mock-service` e um banco
  já estão prontos no `docker-compose.yml` para te ajudar.
- Algum **teste** simples na parte mais importante do back-end.
- Tratar bem os erros na tela (ex.: mostrar uma mensagem quando o CPF não é encontrado).
- Usar um banco de dados relacional em vez de memória.

---

## Como entregar

1. Faça um **fork** deste repositório para a sua conta.
2. Desenvolva na sua cópia. Faça commits ao longo do caminho (não precisa ser perfeito,
   só queremos ver o processo — evite um único commit no final).
3. Preencha o `ENTREGA.md`.
4. Quando terminar, nos envie o **link do seu fork** (deixe-o público ou nos dê acesso).

---

## O que vamos avaliar

- **Funciona?** O check-in acontece e a fila aparece?
- **Organização:** o código está limpo e fácil de ler?
- **Integração:** você consumiu o serviço externo corretamente?
- **Comunicação:** dá para outra pessoa rodar e entender pelo `ENTREGA.md`?

Valorizamos fundamentos bem feitos. Você **não** precisa marcar todos os itens — um
núcleo simples, funcional e bem explicado é o que mais conta.

---

## O que já entregamos para você

- `mock-service/` — o serviço externo de cadastro de pacientes, já pronto. Você **não
  precisa alterá-lo**; apenas consumi-lo a partir da sua API. Veja
  `mock-service/README.md` para os endpoints e os CPFs de teste.
- `docker-compose.yml` — um ponto de partida (opcional) com o `mock-service` e um banco
  já configurados, caso você queira usar Docker.

Boa sorte — e se tiver qualquer dúvida sobre o enunciado, pode nos perguntar. 🙂
