import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { createServer, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { frontendOrigins } from '../src/config';

describe('API com cadastro HTTP real', () => {
  let app: INestApplication;
  let cadastro: Server;
  let mode = 'ok';
  let calls = 0;
  const savedEnv = { ...process.env };

  beforeAll(async () => {
    cadastro = createServer((req, res) => {
      calls++;
      res.setHeader('Content-Type', 'application/json');
      if (mode === 'offline') {
        req.socket.destroy();
        return;
      }
      if (mode === 'missing' || req.url?.endsWith('99999999999')) {
        res.statusCode = 404;
        res.end('{}');
        return;
      }
      if (mode === 'server-error') {
        res.statusCode = 500;
        res.end('{}');
        return;
      }
      if (mode === 'invalid-json') {
        res.end('invalid JSON');
        return;
      }
      if (mode === 'null') {
        res.end('null');
        return;
      }
      if (mode === 'invalid-name') {
        res.end('{"nome":123}');
        return;
      }
      if (mode === 'blank-name') {
        res.end('{"nome":"   "}');
        return;
      }
      if (mode === 'slow' || mode === 'slow-body') {
        if (mode === 'slow-body') res.flushHeaders();
        const timer = setTimeout(() => res.end('{"nome":"Paciente"}'), 2500);
        timer.unref();
        req.on('close', () => clearTimeout(timer));
        return;
      }
      res.end(
        JSON.stringify({
          nome: req.url?.endsWith('11111111111')
            ? 'Ana Souza'
            : 'Bruno Carvalho',
        }),
      );
    });
    await new Promise<void>((resolve) =>
      cadastro.listen(0, '127.0.0.1', resolve),
    );
    process.env.CADASTRO_URL = `http://127.0.0.1:${(cadastro.address() as AddressInfo).port}`;
    // Inclui a inicialização de fetch em um runner frio; falhas lentas demoram 2,5s.
    process.env.CADASTRO_TIMEOUT_MS = '1000';
    process.env.FRONTEND_ORIGIN = 'http://localhost:5173,http://127.0.0.1:5173';
  });

  beforeEach(async () => {
    mode = 'ok';
    calls = 0;
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.enableCors({ origin: frontendOrigins() });
    await app.init();
  });

  afterEach(async () => {
    jest.useRealTimers();
    await app?.close();
  });
  afterAll(async () => {
    cadastro.closeAllConnections();
    await new Promise<void>((resolve) => cadastro.close(() => resolve()));
    process.env = savedEnv;
  });

  it('inicia com healthcheck e fila vazia', async () => {
    await request(app.getHttpServer()).get('/health').expect(200).expect({
      status: 'ok',
      storage: 'memory',
      timezone: 'America/Sao_Paulo',
    });
    await request(app.getHttpServer()).get('/checkins').expect(200).expect([]);
  });

  it('consulta o cadastro e compartilha o registro entre requisições', async () => {
    const created = await request(app.getHttpServer())
      .post('/checkins')
      .send({ cpf: '11111111111' })
      .expect(201);
    expect(created.body).toMatchObject({
      cpf: '11111111111',
      nome: 'Ana Souza',
    });
    expect(
      Number.isFinite(Date.parse(created.body.horarioChegada as string)),
    ).toBe(true);
    await request(app.getHttpServer())
      .get('/checkins')
      .expect(200)
      .expect([created.body]);
    expect(calls).toBe(1);
  });

  it.each([
    '123',
    '111111111111',
    '111.111.111-11',
    123,
    null,
    {},
    ['11111111111'],
  ])('rejeita CPF inválido %j sem consultar o cadastro', async (cpf) => {
    await request(app.getHttpServer())
      .post('/checkins')
      .send({ cpf })
      .expect(400);
    expect(calls).toBe(0);
  });

  it('rejeita corpo sem CPF', async () => {
    await request(app.getHttpServer()).post('/checkins').send({}).expect(400);
    expect(calls).toBe(0);
  });

  it.each([
    ['missing', 404],
    ['server-error', 502],
    ['invalid-json', 502],
    ['null', 502],
    ['invalid-name', 502],
    ['blank-name', 502],
    ['offline', 503],
    ['slow', 503],
    ['slow-body', 503],
  ])(
    'trata falha do cadastro %s com HTTP %i e preserva a fila',
    async (failure, status) => {
      mode = failure as string;
      await request(app.getHttpServer())
        .post('/checkins')
        .send({ cpf: '11111111111' })
        .expect(status as number);
      await request(app.getHttpServer())
        .get('/checkins')
        .expect(200)
        .expect([]);
    },
  );

  it('permite duplicatas e mantém registros concorrentes em ordem de chegada', async () => {
    await Promise.all(
      Array.from({ length: 8 }, () =>
        request(app.getHttpServer())
          .post('/checkins')
          .send({ cpf: '11111111111' })
          .expect(201),
      ),
    );
    const response = await request(app.getHttpServer())
      .get('/checkins')
      .expect(200);
    const rows = response.body as { horarioChegada: string }[];
    expect(rows).toHaveLength(8);
    const dates = rows.map((item) => Date.parse(item.horarioChegada));
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });

  it('considera a virada do dia de São Paulo e não a de UTC', async () => {
    jest.useFakeTimers({
      doNotFake: [
        'hrtime',
        'nextTick',
        'performance',
        'queueMicrotask',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'requestIdleCallback',
        'cancelIdleCallback',
        'setImmediate',
        'clearImmediate',
        'setInterval',
        'clearInterval',
        'setTimeout',
        'clearTimeout',
        'Temporal',
      ],
    });
    jest.setSystemTime(new Date('2026-10-13T01:00:00Z'));
    await request(app.getHttpServer())
      .post('/checkins')
      .send({ cpf: '11111111111' })
      .expect(201);
    expect(
      (await request(app.getHttpServer()).get('/checkins')).body,
    ).toHaveLength(1);
    jest.setSystemTime(new Date('2026-10-13T03:00:00Z'));
    expect(
      (await request(app.getHttpServer()).get('/checkins')).body,
    ).toHaveLength(0);
  });

  it('aceita as origens locais e não libera uma origem diferente no CORS', async () => {
    await request(app.getHttpServer())
      .options('/checkins')
      .set('Origin', 'http://127.0.0.1:5173')
      .set('Access-Control-Request-Method', 'POST')
      .expect(204)
      .expect('Access-Control-Allow-Origin', 'http://127.0.0.1:5173');
    const response = await request(app.getHttpServer())
      .options('/checkins')
      .set('Origin', 'https://different.example')
      .set('Access-Control-Request-Method', 'POST')
      .expect(204);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
