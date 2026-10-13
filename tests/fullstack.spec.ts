import { test, expect } from '@playwright/test';

test('totem, cadastro externo e fila compartilhada pela API', async ({
  page,
  browser,
}) => {
  await page.goto('/#totem');
  await page.locator('#totem-cpf').fill('99999999999');
  await page.getByRole('button', { name: 'Confirmar chegada' }).click();
  await expect(page.getByRole('alert')).toHaveText('Paciente não encontrado');
  await page.locator('#totem-cpf').fill('11111111111');
  await page.getByRole('button', { name: 'Confirmar chegada' }).click();
  await expect(
    page.getByRole('heading', { name: 'Chegada registrada!' }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Ver fila de atendimento', exact: true })
    .click();
  await expect(
    page.getByRole('cell', { name: 'Ana Souza' }).first(),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('cell', { name: 'Ana Souza' }).first(),
  ).toBeVisible();
  const context = await browser.newContext();
  const other = await context.newPage();
  await other.goto('http://localhost:5195/#fila');
  await expect(
    other.getByRole('cell', { name: 'Ana Souza' }).first(),
  ).toBeVisible();
  await other.locator('#cpf').fill('22222222222');
  await other
    .getByRole('button', { name: 'Realizar check-in', exact: true })
    .click();
  await expect(
    other.getByRole('cell', { name: 'Bruno Carvalho' }).first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Atualizar fila' }).click();
  await expect(
    page.getByRole('cell', { name: 'Bruno Carvalho' }).first(),
  ).toBeVisible();
  await context.close();
});

test('a interface trata respostas inválidas e perda de conexão', async ({
  page,
}) => {
  await page.route('**/checkins', (route) =>
    route.fulfill({ json: [{ nome: null }] }),
  );
  await page.goto('/#fila');
  await expect(page.getByRole('alert')).toHaveText('Resposta inválida da API.');
  await page.route('**/checkins', (route) => route.abort('failed'));
  await page.getByRole('button', { name: 'Atualizar fila' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Não foi possível conectar',
  );
  await page.getByRole('link', { name: 'Voltar ao totem' }).click();
  await page.locator('#totem-cpf').fill('11111111111');
  await page.getByRole('button', { name: 'Confirmar chegada' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Não foi possível conectar',
  );
  await expect(
    page.getByRole('button', { name: 'Confirmar chegada' }),
  ).toBeEnabled();
});
