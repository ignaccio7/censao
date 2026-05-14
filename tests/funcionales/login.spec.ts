import { expect, test } from '@playwright/test'

test.describe('Login', () => {
  test('Login exitoso redirige al dashboard', async ({ page }) => {
    // 1. Navega a la pagina del login
    await page.goto('http://localhost:3000/auth/ingresar')

    // 2. Llena el campo de usuario
    await page.locator('input[name="username"]').fill('admin')

    // 3. Llena el campo de contraseña
    await page.locator('input[name="password"]').fill('123')

    // 4. Hace click en el botón
    //await page.locator('button[type="submit"]').click()
    await page.getByRole('button', { name: 'Inicia sesión' }).click()

    // 5. Verifica que fue redirigido al dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard')
  })

  test('Login incorrecto muestra mensaje de error', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/ingresar')

    await page.locator('input[name="username"]').fill('userIncorrect')
    await page.locator('input[name="password"]').fill('123321abc')

    await page.getByRole('button', { name: 'Inicia sesión' }).click()

    await expect(page.getByText('Credenciales incorrectas')).toBeVisible()
  })
})
