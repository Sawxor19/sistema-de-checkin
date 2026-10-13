export function integerSetting(
  name: string,
  fallback: number,
  max = 65535,
): number {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 1 || value > max) {
    throw new Error(`${name} deve ser um inteiro entre 1 e ${max}.`);
  }
  return value;
}

export function cadastroUrl(): string {
  const value = process.env.CADASTRO_URL ?? 'http://localhost:4000';
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('CADASTRO_URL deve ser uma URL HTTP ou HTTPS válida.');
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error(
      'CADASTRO_URL deve ser uma URL HTTP ou HTTPS sem query ou fragmento.',
    );
  }
  return value.replace(/\/+$/, '');
}

export function frontendOrigins(): string[] {
  const origins = (
    process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173'
  )
    .split(',')
    .map((value) => value.trim());
  for (const origin of origins) {
    let url: URL;
    try {
      url = new URL(origin);
    } catch {
      throw new Error(
        'FRONTEND_ORIGIN deve conter origens HTTP ou HTTPS válidas.',
      );
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) {
      throw new Error(
        'FRONTEND_ORIGIN deve conter origens sem caminhos, query ou fragmento.',
      );
    }
  }
  return origins;
}
