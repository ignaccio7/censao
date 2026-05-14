import { Page } from '@playwright/test'

export async function loginWithUser(page: Page, usuario: string) {
  await page.goto('http://localhost:3000/auth/ingresar')
  await page.locator('input[name="username"]').fill(usuario)
  await page.locator('input[name="password"]').fill('123')
  await page.getByRole('button', { name: 'Inicia sesión' }).click()
  // espera a que cargue el dashboard antes de continuar
  await page.waitForURL('**/dashboard')
}
