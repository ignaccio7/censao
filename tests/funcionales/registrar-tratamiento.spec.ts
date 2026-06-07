import { expect, test } from '@playwright/test'

test.describe('Registro de Tratamiento (Vacunación)', () => {
  test('Flujo completo de registro de tratamiento como Enfermería', async ({
    page
  }) => {
    // ── Paso 1: Login como Enfermería ───────────────────────────────
    await page.goto('http://localhost:3000/auth/ingresar')
    await page.locator('input[name="username"]').fill('enfermeria')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: 'Inicia sesión' }).click()

    await expect(page).toHaveURL('http://localhost:3000/dashboard')

    // ── Paso 2: Navegar a la lista de pacientes ─────────────────
    await page.goto('http://localhost:3000/dashboard/atencion/pacientes')

    // ── Paso 3: Clic en "Ver detalle" del primer paciente ────────────────────
    // Se usa el primer botón con title="Ver detalle"
    await page.locator('button[title="Ver detalle"]').first().click()

    // Verificamos que se haya cargado la página de perfil del paciente
    await expect(page).toHaveURL(/\/dashboard\/atencion\/pacientes\/.+/)

    // ── Paso 4: Clic en "Registrar tratamiento" ──────────────────────────────
    // Esperamos a que el botón (enlace) sea visible y hacemos clic
    await page.getByRole('link', { name: /Registrar tratamiento/i }).click()

    // Verificamos que estamos en el formulario de crear tratamiento
    await expect(page).toHaveURL(/\/dashboard\/tratamientos\/.+\/crear/)

    // ── Paso 5: Seleccionar Tipo de Vacuna y Dosis a Aplicar ─────────────────
    // Seleccionamos la primera vacuna válida (index 1 porque index 0 es el placeholder)
    await page.locator('select').first().selectOption({ index: 1 })
    // Seleccionamos el primer esquema (dosis) válida
    await page.locator('select').nth(1).selectOption({ index: 1 })

    // ── Paso 6: Hacer clic en el botón "+ Agregar al registro" ────────────────
    await page.getByRole('button', { name: '+ Agregar al registro' }).click()

    // ── Paso 7 (Validación Parcial): Verificar toast de agregado ────────────────
    await expect(page.getByText(/agregada/i).first()).toBeVisible()

    // ── Paso 8: Hacer clic en el botón "Registrar todo" ───────────────────────
    await page.getByRole('button', { name: /Registrar todo/i }).click()

    // ── Paso 9 (Validación Final): Verificar toast de éxito global ─────────────
    await expect(
      page.getByText(/tratamiento\(s\) registrado\(s\)/i).first()
    ).toBeVisible()

    // ── Paso 10: Verificar que redirige a listado de pacientes ────────────────
    await expect(page).toHaveURL(
      'http://localhost:3000/dashboard/atencion/pacientes'
    )
  })

  test('Validaciones del carrito de vacunas en el frontend', async ({
    page
  }) => {
    // Login
    await page.goto('http://localhost:3000/auth/ingresar')
    await page.locator('input[name="username"]').fill('enfermeria')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: 'Inicia sesión' }).click()
    await expect(page).toHaveURL('http://localhost:3000/dashboard')

    // Navegar a listado de pacientes y luego al primer paciente para registrar
    await page.goto('http://localhost:3000/dashboard/atencion/pacientes')
    await page.locator('button[title="Ver detalle"]').first().click()
    await expect(page).toHaveURL(/\/dashboard\/atencion\/pacientes\/.+/)
    await page.getByRole('link', { name: /Registrar tratamiento/i }).click()
    await expect(page).toHaveURL(/\/dashboard\/tratamientos\/.+\/crear/)

    // 1. Validar que la sección de "Registrar todo" NO es visible con carrito vacío
    await expect(
      page.getByRole('button', { name: /Registrar todo/i })
    ).not.toBeVisible()

    // 2. Botón "+ Agregar al registro" deshabilitado si no hay esquema
    const btnAgregar = page.getByRole('button', {
      name: '+ Agregar al registro'
    })
    await expect(btnAgregar).toBeDisabled()

    // Seleccionar solo vacuna y no esquema, verificar que sigue disabled
    await page.locator('select').first().selectOption({ index: 1 })
    await expect(btnAgregar).toBeDisabled()
  })

  test('El backend rechaza peticiones con tratamientos vacíos (seguridad API)', async ({
    page,
    request
  }) => {
    // Iniciar sesión por UI para capturar la sesión y las cookies
    await page.goto('http://localhost:3000/auth/ingresar')
    await page.locator('input[name="username"]').fill('enfermeria')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: 'Inicia sesión' }).click()
    await expect(page).toHaveURL('http://localhost:3000/dashboard')

    // Extraer cookies para hacer una petición directa al backend simulando un atacante o bypass del frontend
    const cookies = await page.context().cookies()
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ')

    // Enviar POST vacío a la ruta de batch
    const response = await request.post(
      'http://localhost:3000/api/tratamientos/batch',
      {
        headers: {
          Cookie: cookieHeader,
          'Content-Type': 'application/json'
        },
        data: {
          pacienteId: 'cualquier-id',
          tratamientos: [] // ARRAY VACÍO: Esto es lo que el backend debe rechazar
        }
      }
    )

    // Debe ser Bad Request 400
    expect(response.status()).toBe(400)

    const responseBody = await response.json()
    expect(responseBody.success).toBe(false)
    expect(responseBody.message).toBe('Error de validación')

    // Zod debe devolver que el array tiene menos elementos del mínimo requerido (.min(1))
    expect(responseBody.errors.tratamientos).toBeDefined()
  })
})
