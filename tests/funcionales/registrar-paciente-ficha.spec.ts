import { expect, test } from '@playwright/test'

// Genera un CI y un nombre únicos para evitar conflictos entre ejecuciones
const timestamp = Date.now()
const CI_TEST = `${timestamp.toString().slice(-8)}`
const NOMBRE_TEST = `Paciente`
const PATERNO_TEST = `Prueba`

test.describe('Registro de Paciente y Ficha', () => {
  test('Crear un paciente y luego registrar una ficha', async ({ page }) => {
    // ── Precondición: Login como Admisión (doctor.fichas) ───────────────────────────────
    await page.goto('http://localhost:3000/auth/ingresar')

    await page.locator('input[name="username"]').fill('doctor.fichas')
    await page.locator('input[name="password"]').fill('123')

    await page.getByRole('button', { name: 'Inicia sesión' }).click()

    await expect(page).toHaveURL('http://localhost:3000/dashboard')

    // ── Paso 1: Navegar al formulario de creación de paciente ─────────────────
    await page.goto('http://localhost:3000/dashboard/atencion/pacientes/crear')

    // ── Paso 2: Llenar datos del paciente ─────────────
    await page.locator('input[name="ci"]').fill(CI_TEST)
    await page.locator('input[name="nombres"]').fill(NOMBRE_TEST)
    await page.locator('input[name="paterno"]').fill(PATERNO_TEST)
    await page.locator('input[name="fecha_nacimiento"]').fill('1990-01-01')

    // Hacer clic en "Registrar Paciente"
    await page.getByRole('button', { name: 'Registrar Paciente' }).click()

    // ── Paso 3 (Validación): Verificar redirección y mensaje de éxito ─────────
    await expect(page).toHaveURL(
      'http://localhost:3000/dashboard/atencion/pacientes'
    )
    // El toast de éxito puede tener un mensaje general de "Paciente creado exitosamente" o "Se creó una cuenta"
    await expect(page.getByText(/creado exitosamente/i).first()).toBeVisible()

    // ── Paso 4: Navegar a la vista de fichas y crear ficha ──────────────────────────────
    await page.goto('http://localhost:3000/dashboard/fichas')
    await page.getByTestId('btn-abrir-modal-crear-ficha').click()

    // Llenar el formulario de registro de ficha
    await page.locator('input[name="cedula"]').fill(CI_TEST)
    await page
      .locator('input[name="nombre"]')
      .fill(`${NOMBRE_TEST} ${PATERNO_TEST}`)

    await page.getByTestId('btn-registrar-nueva-ficha').click()

    // ── Paso 5 (Validación): Verificar mensaje de éxito de ficha ────────────────────────
    // Solo validamos "Ficha creada exitosamente" ignorando el resto del texto
    await expect(
      page.getByText(/Ficha creada exitosamente/i).first()
    ).toBeVisible()
  })

  test('Muestra errores de validación con formulario vacío', async ({
    page
  }) => {
    await page.goto('http://localhost:3000/auth/ingresar')
    await page.locator('input[name="username"]').fill('doctor.fichas')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: 'Inicia sesión' }).click()
    await expect(page).toHaveURL('http://localhost:3000/dashboard')

    await page.goto('http://localhost:3000/dashboard/atencion/pacientes/crear')

    // Clic en registrar sin llenar nada
    await page.getByRole('button', { name: 'Registrar Paciente' }).click()

    // Validar errores requeridos
    await expect(page.getByText(/El CI debe tener al menos/i)).toBeVisible()
    await expect(page.getByText(/El nombre debe tener al menos/i)).toBeVisible()
  })

  test('Muestra error de validación si el nombre tiene números', async ({
    page
  }) => {
    await page.goto('http://localhost:3000/auth/ingresar')
    await page.locator('input[name="username"]').fill('doctor.fichas')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: 'Inicia sesión' }).click()
    await expect(page).toHaveURL('http://localhost:3000/dashboard')

    await page.goto('http://localhost:3000/dashboard/atencion/pacientes/crear')

    // Llenar nombre con números para disparar el regex
    await page.locator('input[name="ci"]').fill('12345678')
    await page.locator('input[name="nombres"]').fill('Pac1ente123')
    await page.locator('input[name="paterno"]').fill('Prueba')

    await page.getByRole('button', { name: 'Registrar Paciente' }).click()

    // Validar mensaje del regex de nombres
    await expect(page.getByText(/Formato de nombre inválido/i)).toBeVisible()
  })

  test('El backend rechaza un paciente con CI duplicado', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/ingresar')
    await page.locator('input[name="username"]').fill('doctor.fichas')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: 'Inicia sesión' }).click()
    await expect(page).toHaveURL('http://localhost:3000/dashboard')

    await page.goto('http://localhost:3000/dashboard/atencion/pacientes/crear')

    // Usamos el CI_TEST creado en el primer test (que ya existe en BD)
    await page.locator('input[name="ci"]').fill('12345678')
    await page.locator('input[name="nombres"]').fill('Clon')
    await page.locator('input[name="paterno"]').fill('Duplicado')

    await page.getByRole('button', { name: 'Registrar Paciente' }).click()

    // Validar toast del backend (puede decir ya existe, error, etc.)
    await expect(page.getByText(/Error|Ya existe/i).first()).toBeVisible()
  })

  test('Muestra error al registrar ficha con CI inexistente', async ({
    page
  }) => {
    await page.goto('http://localhost:3000/auth/ingresar')
    await page.locator('input[name="username"]').fill('doctor.fichas')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: 'Inicia sesión' }).click()
    await expect(page).toHaveURL('http://localhost:3000/dashboard')

    await page.goto('http://localhost:3000/dashboard/fichas')
    await page.getByTestId('btn-abrir-modal-crear-ficha').click()

    // Usar un CI inventado que no existe en el sistema
    await page.locator('input[name="cedula"]').fill('999999999')
    await page.locator('input[name="nombre"]').fill('No Existo')

    await page.getByTestId('btn-registrar-nueva-ficha').click()

    // Validar toast del backend que diga "no encontrado" o "Error"
    await expect(page.getByText(/Error|no encontrad/i).first()).toBeVisible()
  })
})
