import {
  BadRequestException,
  BadGatewayException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { cadastroUrl, integerSetting } from '../config';

// Estrutura dos dados de um check-in
export interface Checkin {
  cpf: string;
  nome: string;
  horarioChegada: string;
}

@Injectable()
export class CheckinsService {
  // Armazena os check-ins em memória
  private readonly fila: Checkin[] = [];
  private readonly cadastro = cadastroUrl();
  private readonly timeoutMs = integerSetting(
    'CADASTRO_TIMEOUT_MS',
    5000,
    30000,
  );

  // Retorna somente os check-ins do dia atual
  listar(): Checkin[] {
    const formatador = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const hoje = formatador.format(new Date());

    return this.fila
      .filter((checkin) => {
        const dataChegada = formatador.format(new Date(checkin.horarioChegada));

        return dataChegada === hoje;
      })
      .sort(
        (a, b) =>
          new Date(a.horarioChegada).getTime() -
          new Date(b.horarioChegada).getTime(),
      );
  }

  // Registra um novo check-in
  async criar(cpf: string): Promise<Checkin> {
    // 1. Validação do formato do CPF
    if (typeof cpf !== 'string' || !/^\d{11}$/.test(cpf)) {
      throw new BadRequestException('CPF deve conter 11 dígitos');
    }

    // 2. Consulta o serviço externo de pacientes
    let resposta: Response;
    const signal = AbortSignal.timeout(this.timeoutMs);

    try {
      resposta = await fetch(`${this.cadastro}/pacientes/${cpf}`, { signal });
    } catch {
      throw new ServiceUnavailableException('Serviço de cadastro indisponível');
    }

    // 3. Verifica se o paciente existe
    if (resposta.status === 404) {
      throw new NotFoundException('Paciente não encontrado');
    }

    // 4. Trata outros erros do serviço externo
    if (!resposta.ok) {
      throw new BadGatewayException('Falha na consulta ao cadastro');
    }

    // 5. Obtém os dados do paciente
    let paciente: unknown;

    try {
      paciente = await resposta.json();
    } catch {
      if (signal.aborted)
        throw new ServiceUnavailableException(
          'Tempo limite na consulta ao cadastro',
        );
      throw new BadGatewayException('Resposta inválida do cadastro');
    }

    if (
      !paciente ||
      typeof paciente !== 'object' ||
      !('nome' in paciente) ||
      typeof paciente.nome !== 'string' ||
      !paciente.nome.trim()
    ) {
      throw new BadGatewayException('Nome do paciente inválido');
    }

    // 6. Monta o objeto de check-in
    const checkin: Checkin = {
      cpf,
      nome: paciente.nome.trim(),
      horarioChegada: new Date().toISOString(),
    };

    // 7. Adiciona o paciente à fila
    this.fila.push(checkin);

    // 8. Retorna o check-in registrado
    return checkin;
  }
}
