// tests/e2e/flujo-atencion.spec.ts
import { test, expect } from '@playwright/test'
import { loginWithUser } from '../helpers/login'

test.setTimeout(90000)

test('Flujo completo: ficha presencial de ADMISION a ATENDIDA', async ({
  page
}) => {
  // =============================================
  // PASO 1: Admision - Doctor de Fichas crea la ficha
  // =============================================
  await loginWithUser(page, 'doctor.fichas')

  await page.goto('http://localhost:3000/dashboard/fichas')
  // aquí llenas el formulario de nueva ficha
  // Damos clic al boton de "Registrar nueva ficha" para que se habra un modal de registro
  await page.getByTestId('btn-abrir-modal-crear-ficha').click()

  await expect(page.getByTestId('modal-title')).toHaveText(
    'Registrar nueva ficha'
  )
  await page.getByLabel('Cédula').fill('12345678')
  await page.getByLabel('Nombre Completo').fill('Rojas Torres Ana Sofía')

  await page.getByTestId('btn-registrar-nueva-ficha').click()

  // Esperamos que se habra un modal de confirmacion con el mensaje "Ficha creada exitosamente... y mas cosas"
  const toast = page.getByText('Ficha creada exitosamente', { exact: false })
  await toast.waitFor({ state: 'visible', timeout: 30000 })

  // await expect(page.getByText('Ficha creada exitosamente')).toBeVisible({
  //   timeout: 15000
  // })

  // ============================================
  // PASO 2: Enfermería llama al paciente
  // ============================================
  await loginWithUser(page, 'enfermeria')
  await page.goto('http://localhost:3000/dashboard/fichas')
  // Espera a que la página termine TODAS las peticiones de red. Esto es importante para asegurarnos de que la tabla de fichas esté completamente cargada antes de interactuar con ella.
  await page.waitForLoadState('networkidle')

  // Un solo click usando posición en tabla
  const primeraFila = page.locator('table tbody tr').first()
  await expect(
    primeraFila.getByRole('button', { name: 'Llamar' }).first()
  ).toBeVisible({
    timeout: 10000
  })
  await primeraFila.getByRole('button', { name: 'Llamar' }).first().click()

  // Espera que el botón cambie a "Asignar médico"
  const btnAsignar = page
    .getByRole('button', { name: 'Asignar médico' })
    .first()
  await expect(btnAsignar).toBeVisible({ timeout: 15000 })
  await btnAsignar.click()

  // ============================================
  // PASO 3: Asigna especialidad y doctor
  // ============================================
  await expect(page.getByTestId('modal-title')).toHaveText(
    'Asignar ficha a médico'
  )

  const formAssign = page.getByTestId('form-assign-record')
  await expect(formAssign).toBeVisible()
  await formAssign.locator('#especialidad').selectOption({ index: 1 })
  await expect(formAssign.locator('#doctor')).toBeEnabled({ timeout: 15000 })
  await formAssign.locator('#doctor').selectOption({ index: 1 })

  // Verifica que el data-testid existe antes de hacer click
  await formAssign.getByTestId('btn-asignar-ficha').click()
  await expect(page.getByText('Ficha actualizada exitosamente')).toBeVisible({
    timeout: 15000
  })

  // ============================================
  // PASO 4: Doctor General llama y atiende
  // ============================================
  // await loginWithUser(page, 'doctor.general')
  await loginWithUser(page, 'odontologa')
  await page.goto('http://localhost:3000/dashboard/fichas')
  await page.waitForLoadState('networkidle')

  // --- Ronda 1: abrir modal → LLAMAR AL PACIENTE ---
  await page
    .locator('[data-testid^="btn-doctor-abrir-modal-consulta-"]')
    .first()
    .click()

  // Espera que el modal abra antes de buscar el botón
  await expect(
    page.locator('h2').filter({ hasText: 'Registro de consulta' })
  ).toBeVisible({ timeout: 10000 })

  await expect(page.getByTestId('btn-llamar-paciente')).toBeVisible({
    timeout: 10000
  })
  await page.getByTestId('btn-llamar-paciente').click()

  // Espera que el modal cierre
  await expect(
    page.locator('h2').filter({ hasText: 'Registro de consulta' })
  ).toBeHidden({ timeout: 10000 })

  // Espera que la tabla muestre ATENDIENDO antes de re-abrir el modal
  // (el sort pone ATENDIENDO primero, así que sigue siendo index 0)
  await page.waitForTimeout(1500)

  // --- Ronda 2: abrir modal de nuevo → MARCAR COMO ATENDIDO ---
  await page
    .locator('[data-testid^="btn-doctor-abrir-modal-consulta-"]')
    .first()
    .click()

  await expect(
    page.locator('h2').filter({ hasText: 'Registro de consulta' })
  ).toBeVisible({ timeout: 10000 })

  await expect(page.getByTestId('btn-marcar-atendido')).toBeVisible({
    timeout: 10000
  })
  await page.getByTestId('btn-marcar-atendido').click()

  await expect(
    page.getByText('Ficha atendida exitosamente.', { exact: false })
  ).toBeVisible({ timeout: 15000 })
})
