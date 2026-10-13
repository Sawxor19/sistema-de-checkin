// Serviço externo (mock) de cadastro de pacientes.
// Simula a integração REST que a API do candidato deve consumir.
// NÃO precisa ser alterado pelo candidato.

const express = require("express");
const app = express();
app.use(express.json());

// Base de pacientes fictícios. Nenhum dado real.
const PACIENTES = {
  "11111111111": { nome: "Ana Souza",        dataNascimento: "1988-03-12" },
  "22222222222": { nome: "Bruno Carvalho",   dataNascimento: "1975-11-02" },
  "33333333333": { nome: "Carla Menezes",    dataNascimento: "1993-07-25" },
  "44444444444": { nome: "Diego Fernandes",  dataNascimento: "2001-01-30" },
  "55555555555": { nome: "Elaine Rodrigues", dataNascimento: "1960-09-18" },
};

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// GET /pacientes/:cpf  ->  dados do paciente ou 404
app.get("/pacientes/:cpf", (req, res) => {
  const cpf = String(req.params.cpf).replace(/\D/g, "");
  const paciente = PACIENTES[cpf];
  if (!paciente) {
    return res.status(404).json({ erro: "Paciente não encontrado" });
  }
  return res.json({ cpf, ...paciente });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Mock service de cadastro rodando na porta ${PORT}`);
});
