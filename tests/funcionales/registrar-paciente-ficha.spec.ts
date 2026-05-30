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
})
