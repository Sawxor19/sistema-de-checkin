import { useCallback, useEffect, useState, type FormEvent } from 'react';
import './App.css';
import {
  DEMO_MODE,
  listarCheckins,
  criarCheckin,
  type Checkin,
} from './checkins';
import { formatCpf } from './formatters';

const iconPaths = {
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  refresh:
    'M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.6-2L20 8M4 16l2.3 3A7 7 0 0 0 17.9 17',
  id: 'M4 5h16v14H4zM8 9h2v2H8zm-1 6h4m3-6h3m-3 4h3',
  clock: 'M12 8v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8m8 .13a4 4 0 0 1 0 7.75',
  check: 'm5 12 4 4L19 6',
  alert: 'M12 8v5m0 3h.01M12 3 2 21h20L12 3z',
};

function Icon({
  name,
  className = '',
}: {
  name: keyof typeof iconPaths;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

export default function ReceptionPage() {
  // Estados do formulário
  const [cpf, setCpf] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Estados da fila
  const [fila, setFila] = useState<Checkin[]>([]);
  const [carregandoFila, setCarregandoFila] = useState(true);
  const [erroFila, setErroFila] = useState('');

  // Consulta a fonte configurada para a fila.
  const carregarFila = useCallback(async () => {
    setCarregandoFila(true);
    setErroFila('');

    try {
      setFila(await listarCheckins());
    } catch (error) {
      setErroFila(
        error instanceof Error ? error.message : 'Erro ao consultar a fila.',
      );
    } finally {
      setCarregandoFila(false);
    }
  }, []);

  // Carrega a fila ao abrir a página
  useEffect(() => {
    const controller = new AbortController();

    async function carregarFilaInicial() {
      try {
        const dados = await listarCheckins(controller.signal);

        if (!controller.signal.aborted) {
          setFila(dados);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErroFila(
            error instanceof Error
              ? error.message
              : 'Erro ao consultar a fila.',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCarregandoFila(false);
        }
      }
    }

    void carregarFilaInicial();

    return () => controller.abort();
  }, []);

  // Realiza o check-in do paciente
  async function realizarCheckin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensagem('');
    setErro('');

    const cpfLimpo = cpf.replace(/\D/g, '');

    if (!/^\d{11}$/.test(cpfLimpo)) {
      setErro('O CPF deve conter 11 dígitos.');
      return;
    }

    setCarregando(true);

    try {
      const dados = await criarCheckin(cpfLimpo);

      setMensagem(`Check-in realizado com sucesso para ${dados.nome}!`);

      setCpf('');

      // Atualiza a fila depois do check-in
      await carregarFila();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <div className="hospital-brand">
            <img
              src={`${import.meta.env.BASE_URL}haoc-logo.png`}
              alt="Hospital Alemão Oswaldo Cruz"
            />
          </div>
          <div className="header-divider" />
          <div className="header-title">
            <span>RECEPÇÃO</span>
            <strong>Check-in de pacientes</strong>
          </div>
          <div className="header-date">
            <Icon name="clock" />
            <span>
              {new Date().toLocaleDateString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                day: '2-digit',
                month: 'long',
              })}
            </span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="page-intro">
          <a className="totem-back-link" href="#totem">
            ← Voltar ao totem
          </a>
          <p className="eyebrow">
            <span /> BEM-VINDO AO HOSPITAL
          </p>
          <h1>Seu atendimento começa aqui.</h1>
          <p>
            Registre sua chegada de forma simples e acompanhe a fila da
            recepção.
          </p>
        </div>

        {DEMO_MODE && (
          <div className="demo-banner">
            <Icon name="clock" />
            <p>
              <strong>Fila de demonstração.</strong> Os registros ficam nesta
              aba e são limpos ao recarregar a página.
            </p>
          </div>
        )}

        <div className="content-grid">
          <section className="checkin-card" aria-labelledby="titulo-checkin">
            <div className="card-heading">
              <span className="icon-box">
                <Icon name="id" />
              </span>
              <span className="step-label">SUA CHEGADA</span>
            </div>
            <h2 id="titulo-checkin">Realizar check-in</h2>
            <p className="card-description">
              Informe seu CPF para identificar seu cadastro e registrar sua
              chegada.
            </p>

            <form onSubmit={realizarCheckin}>
              <label htmlFor="cpf">CPF do paciente</label>
              <div className="input-wrapper">
                <Icon name="id" />
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={cpf}
                  onChange={(event) => setCpf(formatCpf(event.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  aria-describedby={erro ? 'cpf-ajuda cpf-erro' : 'cpf-ajuda'}
                />
              </div>
              <p className="input-help" id="cpf-ajuda">
                Digite os 11 números do CPF do paciente.
              </p>
              <button
                className="primary-button"
                type="submit"
                disabled={carregando}
              >
                {carregando ? (
                  <>
                    <span className="spinner" /> Registrando chegada...
                  </>
                ) : (
                  <>
                    Realizar check-in
                    <Icon name="arrow" />
                  </>
                )}
              </button>
            </form>

            {mensagem && (
              <div role="status" className="feedback success">
                <Icon name="check" />
                <p>{mensagem}</p>
              </div>
            )}
            {erro && (
              <div role="alert" id="cpf-erro" className="feedback error">
                <Icon name="alert" />
                <p>{erro}</p>
              </div>
            )}

            <div className="arrival-note">
              <span className="note-dot" />
              <p>Após o registro, aguarde a orientação da recepção.</p>
            </div>
            <details className="demo-patients">
              <summary>CPFs de demonstração</summary>
              <p>
                11111111111 · 22222222222 · 33333333333 · 44444444444 ·
                55555555555
              </p>
            </details>
          </section>

          <section
            className="queue-card"
            aria-labelledby="titulo-fila"
            aria-busy={carregandoFila}
          >
            <div className="queue-heading">
              <div>
                <p className="step-label">ACOMPANHAMENTO</p>
                <h2 id="titulo-fila">Fila de atendimento</h2>
                <p className="queue-description">
                  Pacientes registrados em ordem de chegada.
                </p>
              </div>
              <span className="today-badge">Hoje</span>
            </div>
            <div className="queue-toolbar">
              <div className="queue-count">
                <Icon name="users" />
                <strong>
                  {(carregandoFila || erroFila) && !fila.length
                    ? '—'
                    : fila.length}
                </strong>
                <span>
                  {fila.length === 1
                    ? 'paciente registrado'
                    : 'pacientes registrados'}
                </span>
              </div>
              <button
                className="refresh-button"
                type="button"
                onClick={() => void carregarFila()}
                disabled={carregandoFila}
              >
                <Icon
                  name="refresh"
                  className={carregandoFila ? 'rotating' : ''}
                />
                <span>
                  {carregandoFila ? 'Atualizando...' : 'Atualizar fila'}
                </span>
              </button>
            </div>

            {erroFila && (
              <div role="alert" className="feedback error queue-error">
                <Icon name="alert" />
                <p>{erroFila}</p>
              </div>
            )}
            {carregandoFila && !fila.length && (
              <div className="queue-empty" role="status">
                <span className="spinner large" />
                <h3>Consultando a fila</h3>
                <p>Aguarde um instante.</p>
              </div>
            )}
            {!carregandoFila && !fila.length && !erroFila && (
              <div className="queue-empty">
                <div className="empty-icon">
                  <Icon name="users" />
                </div>
                <h3>Nenhum paciente na fila.</h3>
                <p>As chegadas registradas aparecerão aqui.</p>
                <span className="empty-line" />
              </div>
            )}
            {fila.length > 0 && (
              <div className="queue-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Ordem</th>
                      <th scope="col">Paciente</th>
                      <th scope="col" className="cpf-column">
                        CPF
                      </th>
                      <th scope="col">Chegada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fila.map((paciente, index) => (
                      <tr
                        key={`${paciente.cpf}-${paciente.horarioChegada}-${index}`}
                      >
                        <td>
                          <span className="queue-order">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </td>
                        <td>
                          <div className="patient-name">
                            <span className="patient-avatar" aria-hidden="true">
                              {paciente.nome.charAt(0).toUpperCase()}
                            </span>
                            <span>{paciente.nome}</span>
                          </div>
                        </td>
                        <td className="cpf-column">
                          <span className="masked-cpf">
                            {paciente.cpf.slice(0, 3)}.***.***-
                            {paciente.cpf.slice(-2)}
                          </span>
                        </td>
                        <td>
                          <span className="arrival-time">
                            <Icon name="clock" />
                            {new Date(
                              paciente.horarioChegada,
                            ).toLocaleTimeString('pt-BR', {
                              timeZone: 'America/Sao_Paulo',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="queue-footer">
              <Icon name="clock" />
              <span>
                A fila é atualizada após cada check-in e pelo botão acima.
              </span>
            </div>
          </section>
        </div>
        <footer className="site-footer">
          <span>Sistema de check-in hospitalar</span>
          <span>Demonstração educacional · pacientes fictícios</span>
        </footer>
      </main>
    </div>
  );
}
