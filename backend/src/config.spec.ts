import { cadastroUrl, frontendOrigins, integerSetting } from './config';

describe('Configuração por ambiente', () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
  });
  it('rejeita porta inválida em vez de abrir um socket de arquivo', () => {
    process.env.PORT = 'not-a-port';
    expect(() => integerSetting('PORT', 3000)).toThrow(/PORT/);
  });
  it('rejeita timeout ilimitado ou inválido', () => {
    for (const value of ['0', '-1', '30001']) {
      process.env.CADASTRO_TIMEOUT_MS = value;
      expect(() => integerSetting('CADASTRO_TIMEOUT_MS', 5000, 30000)).toThrow(
        /CADASTRO_TIMEOUT_MS/,
      );
    }
  });
  it('rejeita URL de cadastro incompatível com fetch', () => {
    for (const value of [
      'file:///etc/passwd',
      'https://user:secret@example.test',
      'not-a-url',
    ]) {
      process.env.CADASTRO_URL = value;
      expect(cadastroUrl).toThrow(/CADASTRO_URL/);
    }
  });
  it('rejeita caminhos em uma origem CORS', () => {
    process.env.FRONTEND_ORIGIN = 'https://example.test/path';
    expect(frontendOrigins).toThrow(/FRONTEND_ORIGIN/);
  });
});
