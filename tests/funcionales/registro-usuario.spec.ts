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
      'http://localhost:3000/dashboard/admin/usuarios',
      { timeout: 15000 }
    )

    // Debe mostrarse el toast de éxito
    await expect(page.getByText('Usuario creado exitosamente')).toBeVisible()
  })

  test('Muestra errores de validación si el CI empieza con 0 o el formulario está vacío', async ({
    page
  }) => {
    await page.goto('http://localhost:3000/auth/ingresar')
    await page.locator('input[name="username"]').fill('admin')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: 'Inicia sesión' }).click()
    await expect(page).toHaveURL('http://localhost:3000/dashboard')

    await page.goto('http://localhost:3000/dashboard/admin/usuarios/crear')

    // Intentamos avanzar con el formulario vacío
    await page.getByRole('button', { name: 'Siguiente' }).click()

    // Zod debe mostrar los errores requeridos
    await expect(page.getByText(/La cédula debe tener al menos/i)).toBeVisible()
    await expect(page.getByText(/El nombre debe tener al menos/i)).toBeVisible()

    // Probamos el nuevo caso: CI empezando con 0
    await page.locator('input[name="ci"]').fill('0123456')
    // Hacemos clic fuera para disparar el blur/validación
    await page.locator('input[name="nombres"]').click()

    // Debe mostrar el error del regex que agregamos
    await expect(page.getByText(/Formato inválido/i)).toBeVisible()
  })

  test('Muestra error si las contraseñas no coinciden', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/ingresar')
    await page.locator('input[name="username"]').fill('admin')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: 'Inicia sesión' }).click()
    await expect(page).toHaveURL('http://localhost:3000/dashboard')

    await page.goto('http://localhost:3000/dashboard/admin/usuarios/crear')

    // Llenamos el Paso 1 para poder avanzar al Paso 2
    await page
      .locator('input[name="ci"]')
      .fill(`88${Date.now().toString().slice(-6)}`)
    await page.locator('input[name="nombres"]').fill('Juan')
    await page.locator('input[name="paterno"]').fill('Perez')
    await page
      .locator('input[name="correo"]')
      .fill(`test${Date.now()}@censao.test`)
    await page.getByRole('button', { name: 'Siguiente' }).click()

    // Paso 2: Credenciales dispares
    await page.locator('input[name="username"]').fill('juanp')
    await page.locator('input[name="password"]').fill('Password123!')
    await page.locator('input[name="confirmar_password"]').fill('Password321!')

    await page.getByRole('button', { name: 'Siguiente' }).click()

    // El frontend debe bloquear y mostrar que no coinciden
    await expect(page.getByText(/Las contraseñas no coinciden/i)).toBeVisible()
  })

  test('El backend rechaza un username o CI duplicado', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/ingresar')
    await page.locator('input[name="username"]').fill('admin')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: 'Inicia sesión' }).click()
    await expect(page).toHaveURL('http://localhost:3000/dashboard')

    await page.goto('http://localhost:3000/dashboard/admin/usuarios/crear')

    // Usamos el CI_TEST y USERNAME_TEST creados en el primer test (deberían estar duplicados ahora)
    await page.locator('input[name="ci"]').fill('12345678')
    await page.locator('input[name="nombres"]').fill('Clon')
    await page.locator('input[name="paterno"]').fill('Duplicado')
    await page.locator('input[name="correo"]').fill(EMAIL_TEST)
    await page.getByRole('button', { name: 'Siguiente' }).click()

    await page.locator('input[name="username"]').fill('admin123')
    await page.locator('input[name="password"]').fill(PASSWORD_TEST)
    await page.locator('input[name="confirmar_password"]').fill(PASSWORD_TEST)
    await page.getByRole('button', { name: 'Siguiente' }).click()

    await page.getByRole('button', { name: 'ADMINISTRADOR' }).click()
    await page.getByRole('button', { name: 'Siguiente' }).click()

    // Al confirmar, el backend debe fallar
    await page
      .getByRole('button', { name: 'Confirmar y crear usuario' })
      .click()

    // Esperamos que aparezca un toast de error (puede decir error al crear, o ya existe)
    await expect(page.getByText(/Error|Ya existe/i).first()).toBeVisible()
  })
})
