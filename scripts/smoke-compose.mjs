import assert from 'node:assert/strict';

const origin = process.env.COMPOSE_URL || 'http://localhost:5180';
async function call(path, options) {
  return fetch(`${origin}${path}`, {
    ...options,
    signal: AbortSignal.timeout(10000),
  });
}
assert.equal((await call('/')).status, 200);
assert.equal((await call('/haoc-logo.png')).status, 200);
const health = await call('/api/health');
assert.equal(health.status, 200);
assert.equal((await health.json()).storage, 'memory');
const created = await call('/api/checkins', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cpf: '11111111111' }),
});
assert.equal(created.status, 201);
const patient = await created.json();
assert.equal(patient.nome, 'Ana Souza');
const queue = await call('/api/checkins');
assert.equal(queue.status, 200);
assert.ok((await queue.json()).some((item) => item.cpf === patient.cpf));
const unknown = await call('/api/checkins', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cpf: '99999999999' }),
});
assert.equal(unknown.status, 404);
console.log('Compose validado: interface, logo, proxy, API, cadastro e fila.');
