import { expect, test, type Page } from '@playwright/test';

async function finishOnboarding(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue with this device' }).click();
  await page.getByLabel('What should we call you?').fill('Test planner');
  for (let step = 0; step < 6; step++) await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Start my planner' }).click();
}

test('onboarding saves without sample health data and creates an editable month', async ({ page }) => {
  await finishOnboarding(page);
  await expect(page.getByRole('heading', { name: /Good morning, Test/ })).toBeVisible();
  await page.goto('/#/plan');
  await expect(page.getByText('400 recipes')).toBeVisible();
  await page.getByRole('button', { name: 'Create 30 days' }).click();
  await expect(page.getByText('Your 30-day plan is saved.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Refresh unlocked' })).toBeVisible();
});

test('static catalog and hash workspace navigation load without an API', async ({ page }) => {
  await finishOnboarding(page);
  await page.goto('/#/exercise');
  await expect(page.getByRole('heading', { name: 'Choose a small win' })).toBeVisible();
  await expect(page.getByText('Google’s API does not support task reminder times.')).toBeVisible();
  await page.goto('/#/health');
  await expect(page.getByRole('heading', { name: 'Add a measurement' })).toBeVisible();
});

test('personal foods persist in the local meal dataset', async ({ page }) => {
  await finishOnboarding(page);
  await page.goto('/#/plan');
  await expect(page.getByText('400 recipes')).toBeVisible();
  await page.getByRole('button', { name: 'Create a custom recipe' }).click();
  await page.getByLabel('Name').fill('Desk-day oats');
  await page.getByLabel('calories per serving').fill('320');
  await page.getByLabel('Ingredients: one per line as “food | grams”').fill('Oats | 50\nYogurt | 150');
  await page.getByLabel('Preparation steps').fill('Combine and chill.');
  await page.getByRole('button', { name: 'Save to my food dataset' }).click();
  await expect(page.getByText('401 recipes')).toBeVisible();
});
