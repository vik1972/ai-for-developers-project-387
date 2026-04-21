import { test, expect } from '@playwright/test';

test.describe('Owner Dashboard Flow', () => {
  test('should display dashboard with statistics', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText('Дашборд владельца')).toBeVisible();
    await expect(page.getByText('Типов событий')).toBeVisible();
    await expect(page.getByText('Всего бронирований')).toBeVisible();
    await expect(page.getByText('Предстоящих встреч', { exact: true })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Создать событие' })).toBeVisible();
  });

  test('should display events section on dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText('Типы событий')).toBeVisible();
  });

  test('should navigate to event types page', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('link', { name: 'Создать событие' }).click();

    await expect(page.getByText('Типы событий')).toBeVisible();
    await expect(page.getByText('Управляйте типами событий для бронирования')).toBeVisible();
  });

  test('should create a new event type', async ({ page }) => {
    await page.goto('/events');

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Создать тип события' }).click();

    await expect(page.getByRole('heading', { name: 'Создать тип события' })).toBeVisible();

    await page.getByLabel('Название').fill('Тестовое событие');
    await page.getByLabel('Описание').fill('Описание тестового события для E2E теста');
    await page.getByLabel('Длительность (в минутах)').fill('90');

    await page.getByRole('button', { name: 'Создать', exact: true }).click();

    await page.waitForTimeout(500);

    await expect(page.locator('text=Тестовое событие').first()).toBeVisible();
  });

  test('should show validation errors on create event form', async ({ page }) => {
    await page.goto('/events');

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Создать тип события' }).click();

    await page.getByLabel('Название').fill('АБ');
    await page.getByLabel('Название').press('Tab');

    await page.getByRole('button', { name: 'Создать', exact: true }).click();

    await expect(page.getByText('Минимум 3 символа')).toBeVisible();
  });

  test('should delete an event', async ({ page }) => {
    await page.goto('/events');

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Создать тип события' }).click();
    await page.getByLabel('Название').fill('Событие для удаления');
    await page.getByLabel('Описание').fill('Это событие будет удалено');
    await page.getByLabel('Длительность (в минутах)').fill('30');
    await page.getByRole('button', { name: 'Создать', exact: true }).click();

    await page.waitForTimeout(500);

    await expect(page.locator('text=Событие для удаления').first()).toBeVisible();

    page.on('dialog', dialog => dialog.accept());

    const deleteButton = page.locator('text=Событие для удаления').locator('..').locator('..').getByRole('button');
    await deleteButton.click();

    await expect(page.locator('text=Событие для удаления')).not.toBeVisible({ timeout: 10000 });
  });

  test('should navigate back to home from event types page', async ({ page }) => {
    await page.goto('/events');

    await page.waitForTimeout(500);

    await page.getByRole('link', { name: 'На главную' }).click();

    await expect(page.getByRole('heading', { name: 'Система бронирования встреч' })).toBeVisible();
  });
});
