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

  test('Login con campos vacíos muestra error de credenciales', async ({
    page
  }) => {
    await page.goto('http://localhost:3000/auth/ingresar')

    // Eliminamos los atributos required del DOM (como haríamos en devtools)
    // para forzar que la petición viaje al backend y probar su validación
    await page.evaluate(() => {
      document.querySelectorAll('input[required]').forEach(input => {
        input.removeAttribute('required')
      })
    })

    // No llenamos ningún campo — hacemos clic directamente en el botón
    await page.getByRole('button', { name: 'Inicia sesión' }).click()

    // El backend rechaza credenciales vacías y muestra el mensaje de error
    await expect(page.getByText('Credenciales incorrectas')).toBeVisible()
  })

  test('Login solo con username (sin contraseña) muestra error', async ({
    page
  }) => {
    await page.goto('http://localhost:3000/auth/ingresar')

    // Eliminamos los atributos required
    await page.evaluate(() => {
      document.querySelectorAll('input[required]').forEach(input => {
        input.removeAttribute('required')
      })
    })

    // Solo llena el username, deja el password vacío
    await page.locator('input[name="username"]').fill('admin')

    await page.getByRole('button', { name: 'Inicia sesión' }).click()

    // El backend no puede autenticar sin contraseña → error
    await expect(page.getByText('Credenciales incorrectas')).toBeVisible()
  })

  test('Acceso directo a ruta protegida sin sesión redirige al login', async ({
    page
  }) => {
    // Intentar acceder al dashboard sin haberse logueado
    await page.goto('http://localhost:3000/dashboard')

    // El middleware de Next.js debe redirigir a la página de login
    await expect(page).toHaveURL(/\/auth\/ingresar/)
  })
})
