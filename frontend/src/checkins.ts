import { serviceDate } from './formatters';

export interface Checkin {
  cpf: string;
  nome: string;
  horarioChegada: string;
}

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.VITE_HOSTED === 'true' ? '' : 'http://localhost:3000')
).replace(/\/$/, '');

// O Pages usa uma fila temporária por aba. O modo local continua usando NestJS.
const filaEmMemoria: Checkin[] = [];
const pacientes: Record<string, string> = {
  '11111111111': 'Ana Souza',
  '22222222222': 'Bruno Carvalho',
  '33333333333': 'Carla Menezes',
  '44444444444': 'Diego Fernandes',
  '55555555555': 'Elaine Rodrigues',
};

function requireApi() {
  if (!API_URL)
    throw new Error(
      'O serviço de atendimento ainda não está disponível neste endereço.',
    );
}

export async function listarCheckins(signal?: AbortSignal): Promise<Checkin[]> {
  signal?.throwIfAborted();
  if (DEMO_MODE) {
    const hoje = serviceDate();
    return filaEmMemoria
      .filter((item) => serviceDate(new Date(item.horarioChegada)) === hoje)
      .sort(
        (a, b) => Date.parse(a.horarioChegada) - Date.parse(b.horarioChegada),
      )
      .map((item) => ({ ...item }));
  }
  const resposta = await apiRequest('/checkins', { signal });
  if (!resposta.ok) throw new Error('Não foi possível consultar a fila.');
  const dados = await readJson(resposta);
  if (!Array.isArray(dados) || !dados.every(isCheckin))
    throw new Error('Resposta inválida da API.');
  return dados;
}

export async function criarCheckin(cpf: string): Promise<Checkin> {
  if (!/^\d{11}$/.test(cpf)) throw new Error('CPF deve conter 11 dígitos');
  if (DEMO_MODE) {
    const nome = pacientes[cpf];
    if (!nome) throw new Error('Paciente não encontrado');
    const item = { cpf, nome, horarioChegada: new Date().toISOString() };
    filaEmMemoria.push(item);
    return { ...item };
  }
  const resposta = await apiRequest('/checkins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf }),
  });
  const dados = await readJson(resposta);
  if (!resposta.ok)
    throw new Error(
      dados &&
        typeof dados === 'object' &&
        'message' in dados &&
        typeof dados.message === 'string'
        ? dados.message
        : 'Erro ao realizar check-in.',
    );
  if (!isCheckin(dados)) throw new Error('Resposta inválida da API.');
  return dados;
}

function isCheckin(value: unknown): value is Checkin {
  if (!value || typeof value !== 'object') return false;
  return (
    'cpf' in value &&
    typeof value.cpf === 'string' &&
    /^\d{11}$/.test(value.cpf) &&
    'nome' in value &&
    typeof value.nome === 'string' &&
    !!value.nome.trim() &&
    'horarioChegada' in value &&
    typeof value.horarioChegada === 'string' &&
    Number.isFinite(Date.parse(value.horarioChegada))
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    throw new Error('Resposta inválida da API.', { cause: error });
  }
}

async function apiRequest(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  requireApi();
  const timeout = AbortSignal.timeout(8000);
  const signal = init.signal
    ? AbortSignal.any([init.signal, timeout])
    : timeout;
  try {
    return await fetch(`${API_URL}${path}`, { ...init, signal });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new Error(
      timeout.aborted
        ? 'A consulta demorou demais. Tente novamente.'
        : 'Não foi possível conectar ao serviço de atendimento. Tente novamente.',
      { cause: error },
    );
  }
}
