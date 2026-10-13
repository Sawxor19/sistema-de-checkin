import { test, expect } from '@playwright/test';

test('teclado, CPF desconhecido, registro e navegação sem API', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (['fetch', 'xhr'].includes(request.resourceType()))
      requests.push(request.url());
  });
  await page.goto('./#totem');
  const input = page.locator('#totem-cpf');
  await expect(
    page.getByRole('button', { name: 'Confirmar chegada' }),
  ).toBeDisabled();
  await page.getByRole('button', { name: '1', exact: true }).click();
  await page.getByRole('button', { name: '2', exact: true }).click();
  await page.getByRole('button', { name: 'Apagar último dígito' }).click();
  await expect(input).toHaveValue('1');
  await page.getByRole('button', { name: 'Limpar', exact: true }).click();
  await expect(input).toHaveValue('');
  await input.fill('99999999999');
  await page.getByRole('button', { name: 'Confirmar chegada' }).click();
  await expect(page.getByRole('alert')).toHaveText('Paciente não encontrado');
  await input.fill('11111111111');
  await page.getByRole('button', { name: 'Confirmar chegada' }).click();
  await expect(
    page.getByRole('heading', { name: 'Chegada registrada!' }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Ver fila de atendimento', exact: true })
    .click();
  await expect(page.getByRole('cell', { name: 'Ana Souza' })).toBeVisible();
  await page.getByRole('link', { name: 'Voltar ao totem' }).click();
  await expect(input).toBeVisible();
  await page.getByRole('link', { name: 'Ver fila', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Ana Souza' })).toBeVisible();
  expect(requests).toEqual([]);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Nenhum paciente na fila.' }),
  ).toBeVisible();
});

test('memória isolada por aba e registro na recepção', async ({
  page,
  context,
}) => {
  await page.goto('./#fila');
  await page.locator('#cpf').fill('22222222222');
  await page
    .getByRole('button', { name: 'Realizar check-in', exact: true })
    .click();
  await expect(
    page.getByRole('cell', { name: 'Bruno Carvalho' }),
  ).toBeVisible();
  const other = await context.newPage();
  await other.goto('http://localhost:5196/sistema-de-checkin/#fila');
  await expect(
    other.getByRole('heading', { name: 'Nenhum paciente na fila.' }),
  ).toBeVisible();
});

test('limpa CPF por inatividade e confirmação por tempo, mantendo a fila', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('./#totem');
  await page.locator('#totem-cpf').fill('111');
  await page.clock.fastForward(60001);
  await expect(page.locator('#totem-cpf')).toHaveValue('');
  await page.locator('#totem-cpf').fill('11111111111');
  await page.getByRole('button', { name: 'Confirmar chegada' }).click();
  await expect(
    page.getByRole('heading', { name: 'Chegada registrada!' }),
  ).toBeVisible();
  await page.clock.fastForward(30001);
  await expect(page.locator('#totem-cpf')).toHaveValue('');
  await page.getByRole('link', { name: 'Ver fila', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Ana Souza' })).toBeVisible();
});

test('totem e fila cabem no celular e carregam a marca', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#totem');
  await expect(
    page.getByRole('img', { name: 'Hospital Alemão Oswaldo Cruz' }),
  ).toBeVisible();
  expect(
    await page
      .locator('img')
      .evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBeGreaterThan(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator('#totem-cpf').fill('55555555555');
  await page.getByRole('button', { name: 'Confirmar chegada' }).click();
  await page.getByRole('button', { name: 'Próximo paciente' }).click();
  await expect(page.locator('#totem-cpf')).toHaveValue('');
  await page.getByRole('link', { name: 'Ver fila', exact: true }).click();
  await expect(
    page.getByRole('cell', { name: 'Elaine Rodrigues' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
