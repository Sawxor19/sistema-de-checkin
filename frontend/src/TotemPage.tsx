import { useEffect, useState, type FormEvent } from 'react';
import { criarCheckin, DEMO_MODE, type Checkin } from './checkins';
import './TotemPage.css';
import { formatCpf } from './formatters';

const paths = {
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  check: 'm5 12 4 4L19 6',
  delete: 'M9 5h11v14H9l-7-7 7-7zm3 4 5 6m0-6-5 6',
  ticket: 'M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4V7zm9 0v2m0 2v2m0 2v2',
  clock: 'M12 8v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
};

function TotemIcon({ name }: { name: keyof typeof paths }) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

export default function TotemPage() {
  const [cpf, setCpf] = useState('');
  const [receipt, setReceipt] = useState<Checkin | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(30);

  function reset() {
    setReceipt(null);
    setCpf('');
    setError('');
    setRemaining(30);
  }

  useEffect(() => {
    if (!receipt) return;
    const interval = window.setInterval(
      () => setRemaining((value) => Math.max(0, value - 1)),
      1000,
    );
    const timeout = window.setTimeout(() => {
      setReceipt(null);
      setCpf('');
      setError('');
      setRemaining(30);
    }, 30000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [receipt]);

  useEffect(() => {
    if (!cpf || pending || receipt) return;
    const timeout = window.setTimeout(() => {
      setCpf('');
      setError('');
    }, 60000);
    return () => window.clearTimeout(timeout);
  }, [cpf, pending, receipt]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cpf.length !== 11) {
      setError('Informe os 11 dígitos do seu CPF.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const item = await criarCheckin(cpf);
      setRemaining(30);
      setReceipt(item);
      setCpf('');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar sua chegada.',
      );
    } finally {
      setPending(false);
    }
  }

  function press(key: string) {
    setCpf((value) =>
      key === 'Limpar'
        ? ''
        : key === 'Apagar'
          ? value.slice(0, -1)
          : (value + key).slice(0, 11),
    );
    setError('');
  }

  return (
    <div className="totem-app">
      <header className="totem-header">
        <a
          href="#totem"
          className="totem-brand"
          aria-label="Hospital Alemão Oswaldo Cruz, início"
        >
          <span className="totem-logo-frame">
            <img
              src={`${import.meta.env.BASE_URL}haoc-logo.png`}
              alt="Hospital Alemão Oswaldo Cruz"
            />
          </span>
        </a>
        <div className="totem-header-actions">
          <span>AUTOATENDIMENTO · CHEGADA</span>
          <a href="#fila" className="totem-queue-link">
            Ver fila <TotemIcon name="arrow" />
          </a>
        </div>
      </header>
      <main className="totem-main">
        <section className="totem-intro">
          <span className="totem-eyebrow">BEM-VINDO</span>
          <h1>
            O cuidado começa
            <br />
            <span>com a sua chegada.</span>
          </h1>
          <p>
            Registre seu CPF e confirme sua chegada.
            <br />
            Nossa equipe orienta você na recepção.
          </p>
          <div className="totem-instructions">
            <span>
              <b>1</b> Informe seu CPF
            </span>
            <span>
              <b>2</b> Confirme sua chegada
            </span>
            <span>
              <b>3</b> Aguarde a recepção
            </span>
          </div>
          <p className="totem-help">
            Precisa de ajuda? Procure nossa recepção.
          </p>
          {DEMO_MODE && (
            <p className="totem-memory-note">
              Demonstração: a fila fica nesta aba e é limpa ao recarregar a
              página.
            </p>
          )}
        </section>
        <section className="totem-card" aria-label="Check-in de chegada">
          {receipt ? (
            <div className="totem-success" role="status">
              <span className="totem-success-circle">
                <TotemIcon name="check" />
              </span>
              <h2>Chegada registrada!</h2>
              <p>Seja bem-vindo,</p>
              <strong className="totem-patient-name">{receipt.nome}</strong>
              <span className="totem-arrival-time">
                <TotemIcon name="clock" /> Chegada às{' '}
                {new Date(receipt.horarioChegada).toLocaleTimeString('pt-BR', {
                  timeZone: 'America/Sao_Paulo',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <div className="totem-directions">
                <TotemIcon name="ticket" />
                <span>
                  Sua chegada foi incluída na fila. Aguarde a orientação da{' '}
                  <strong>recepção</strong>.
                </span>
              </div>
              <button className="totem-primary" type="button" onClick={reset}>
                Próximo paciente <TotemIcon name="arrow" />
              </button>
              <a className="totem-view-queue" href="#fila">
                Ver fila de atendimento
              </a>
              <small>
                Esta confirmação será limpa em {remaining} segundos.
              </small>
            </div>
          ) : (
            <form onSubmit={(event) => void submit(event)}>
              <span className="totem-card-label">
                <TotemIcon name="ticket" /> REGISTRE SUA CHEGADA
              </span>
              <h2>Qual é o seu CPF?</h2>
              <label htmlFor="totem-cpf">CPF do paciente</label>
              <input
                id="totem-cpf"
                className="totem-cpf"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={14}
                placeholder="000.000.000-00"
                value={formatCpf(cpf)}
                disabled={pending}
                aria-describedby={error ? 'totem-error' : undefined}
                onChange={(event) => {
                  setCpf(event.target.value.replace(/\D/g, '').slice(0, 11));
                  setError('');
                }}
              />
              <div className="totem-keypad" aria-label="Teclado numérico">
                {[
                  '1',
                  '2',
                  '3',
                  '4',
                  '5',
                  '6',
                  '7',
                  '8',
                  '9',
                  'Limpar',
                  '0',
                  'Apagar',
                ].map((key) => (
                  <button
                    type="button"
                    key={key}
                    disabled={pending}
                    aria-label={key === 'Apagar' ? 'Apagar último dígito' : key}
                    onClick={() => press(key)}
                  >
                    {key === 'Apagar' ? <TotemIcon name="delete" /> : key}
                  </button>
                ))}
              </div>
              {error && (
                <p id="totem-error" className="totem-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="totem-primary"
                type="submit"
                disabled={pending || cpf.length !== 11}
              >
                {pending ? (
                  <span className="spinner" />
                ) : (
                  <TotemIcon name="arrow" />
                )}
                {pending ? 'Registrando chegada…' : 'Confirmar chegada'}
              </button>
              <p className="totem-guidance">
                Após confirmar, sua chegada aparecerá na fila.
              </p>
            </form>
          )}
        </section>
      </main>
      <footer className="totem-footer">
        <span>Hospital Alemão Oswaldo Cruz</span>
        <span>Demonstração · CPF de exemplo: 111.111.111-11</span>
      </footer>
    </div>
  );
}
