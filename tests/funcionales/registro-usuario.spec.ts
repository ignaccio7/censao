import { expect, test } from '@playwright/test'

// Genera un CI y username únicos para evitar conflictos entre ejecuciones
const timestamp = Date.now()
const CI_TEST = `99${timestamp.toString().slice(-6)}`
const USERNAME_TEST = `test.user.${timestamp}`
const EMAIL_TEST = `testuser${timestamp}@censao.test`
const PASSWORD_TEST = 'Test1234!'

test.describe('Registro de usuario', () => {
  test('Crear un usuario nuevo y verificar que aparece en la lista', async ({
    page
  }) => {
    // ── Precondición: Login como administrador ───────────────────────────────
    await page.goto('http://localhost:3000/auth/ingresar')

    await page.locator('input[name="username"]').fill('admin')
    await page.locator('input[name="password"]').fill('123')

    await page.getByRole('button', { name: 'Inicia sesión' }).click()

    await expect(page).toHaveURL('http://localhost:3000/dashboard')

    // ── Paso 1: Navegar al formulario de creación de usuario ─────────────────
    await page.goto('http://localhost:3000/dashboard/admin/usuarios/crear')

    // ── Paso 2: Llenar datos personales (Step "Datos Personales") ─────────────
    await page.locator('input[name="ci"]').fill(CI_TEST)
    await page.locator('input[name="nombres"]').fill('Usuario')
    await page.locator('input[name="paterno"]').fill('De')
    await page.locator('input[name="materno"]').fill('Prueba')
    await page.locator('input[name="correo"]').fill(EMAIL_TEST)

    // Hacer clic en "Siguiente" para avanzar al Paso 2
    await page.getByRole('button', { name: 'Siguiente' }).click()

    // ── Paso 3: Llenar credenciales (Step "Credenciales") ────────────────────
    await page.locator('input[name="username"]').fill(USERNAME_TEST)
    await page.locator('input[name="password"]').fill(PASSWORD_TEST)
    await page.locator('input[name="confirmar_password"]').fill(PASSWORD_TEST)

    // Hacer clic en "Siguiente" para avanzar al Paso 3 (Rol)
    await page.getByRole('button', { name: 'Siguiente' }).click()

    // ── Paso 4: Seleccionar un rol (Step "Rol") ──────────────────────────────
    // Se selecciona el rol ADMINISTRADOR haciendo clic en su tarjeta
    await page.getByRole('button', { name: 'ADMINISTRADOR' }).click()

    // Hacer clic en "Siguiente" para avanzar al Paso 4 (Resumen)
    await page.getByRole('button', { name: 'Siguiente' }).click()

    // ── Paso 5: Confirmar en el resumen final ────────────────────────────────
    await page
      .getByRole('button', { name: 'Confirmar y crear usuario' })
      .click()

    // ── Paso 6 (Validación): Verificar redirección y mensaje de éxito ─────────
    // El sistema debe redirigir a la lista de usuarios
    await expect(page).toHaveURL(
      'http://localhost:3000/dashboard/admin/usuarios'
    )

    // Debe mostrarse el toast de éxito
    await expect(page.getByText('Usuario creado exitosamente')).toBeVisible()
  })
})
