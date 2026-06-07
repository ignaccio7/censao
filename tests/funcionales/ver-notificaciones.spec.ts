import { expect, test } from '@playwright/test'

test.describe('Bandeja de Notificaciones del Paciente', () => {
  test('Verificar notificaciones vacías desde el header y la página completa', async ({
    page
  }) => {
    // ── Paso 1: Login como Paciente ───────────────────────────────
    await page.goto('http://localhost:3000/auth/ingresar')
    // await page.locator('input[name="username"]').fill('paciente1')
    // await page.locator('input[name="password"]').fill('123')
    await page.locator('input[name="username"]').fill('paciente1')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: 'Inicia sesión' }).click()

    // Esperar a que el dashboard cargue completamente
    await expect(page).toHaveURL(/.*\/dashboard/)

    // ── Paso 2: Abrir panel desplegable de notificaciones ─────────
    await page.getByRole('button', { name: /Abrir notificaciones/i }).click()

    // ── Paso 3: Validar que no hay notificaciones en el panel ──────
    // Utilizamos coincidencia parcial ignorando mayúsculas/minúsculas
    await expect(
      page.getByText(/No tienes notificaciones/i).first()
    ).toBeVisible()

    // ── Paso 4: Navegar a la bandeja completa de notificaciones ────
    await page.goto('http://localhost:3000/dashboard/notificaciones')

    // ── Paso 5: Validar que no hay notificaciones en la vista ─────
    await expect(
      page.getByText(/No tienes notificaciones aún/i).first()
    ).toBeVisible()
  })

  test('Redirige al login si se intenta acceder a notificaciones sin sesión', async ({
    page
  }) => {
    await page.goto('http://localhost:3000/dashboard/notificaciones')
    // El middleware debe atrapar esto y enviarnos al login
    await expect(page).toHaveURL(/.*\/auth\/ingresar/)
  })

  test('Usuarios sin rol PACIENTE no pueden ver la campana de notificaciones', async ({
    page
  }) => {
    // Login como Enfermería
    await page.goto('http://localhost:3000/auth/ingresar')
    await page.locator('input[name="username"]').fill('enfermeria')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: 'Inicia sesión' }).click()
    await expect(page).toHaveURL('http://localhost:3000/dashboard')

    // Validar que el ícono de notificaciones no existe para este rol
    await expect(
      page.getByRole('button', { name: /Abrir notificaciones/i })
    ).not.toBeVisible()
  })
})
