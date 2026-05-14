// tests/e2e/flujo-atencion.spec.ts
import { test, expect } from '@playwright/test'
import { loginWithUser } from '../helpers/login'

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
  await page.getByLabel('Cédula').fill('123456789')
  await page.getByLabel('Nombre Completo').fill('Juan Perez Garcia')

  await page.getByTestId('btb-registrar-nueva-ficha').click()

  // Esperamos que se habra un modal de confirmacion con el mensaje "Ficha creada exitosamente... y mas cosas"
  await expect(page.getByText('Ficha creada exitosamente')).toBeVisible()

  // ============================================
  // PASO 2: Enfermería llama al paciente
  // ============================================
  await loginWithUser(page, 'enfermeria')
  await page.goto('http://localhost:3000/dashboard/fichas')
  await page.waitForLoadState('networkidle')

  // Un solo click usando posición en tabla
  const primeraFila = page.locator('tbody tr').first()
  await expect(primeraFila.getByRole('button').first()).toBeVisible({
    timeout: 10000
  })
  await primeraFila.getByRole('button').first().click()

  // Espera que el botón cambie a "Asignar médico"
  const btnAsignar = page
    .getByRole('button', { name: 'Asignar médico' })
    .first()
  await expect(btnAsignar).toBeVisible({ timeout: 15000 })
  await btnAsignar.click()

  // ============================================
  // PASO 3: Asigna especialidad y doctor
  // ============================================
  await expect(
    page.getByRole('heading', { name: 'Asignar ficha a médico' })
  ).toBeVisible()

  await page.locator('#especialidad').selectOption({ index: 1 })
  await expect(page.locator('#doctor')).toBeEnabled({ timeout: 10000 })
  await page.locator('#doctor').selectOption({ index: 1 })

  // Verifica que el data-testid existe antes de hacer click
  await page.getByTestId('btn-asignar-ficha').click()
  await expect(page.getByText('Ficha asignada')).toBeVisible({ timeout: 10000 })

  // ============================================
  // PASO 4: Doctor General llama y atiende
  // ============================================
  await loginWithUser(page, 'odontologa') // o doctor.general según tu usuario
  await page.goto('http://localhost:3000/dashboard/fichas')
  await page.waitForLoadState('networkidle')

  // Busca en la primera tabla (tab En Espera activo por defecto)
  const tablaActiva = page.locator('tbody').first()
  const btnConsulta = tablaActiva
    .locator('[data-testid^="btn-abrir-consulta-"]')
    .first()
  await expect(btnConsulta).toBeVisible()
  await btnConsulta.click()

  // Modal muestra "Llamar al paciente" — ficha está en EN_ESPERA
  await expect(
    page.getByRole('heading', { name: 'Registro de consulta' })
  ).toBeVisible()
  await page.getByTestId('btn-llamar-paciente').click()

  // Modal se cierra, fila cambia a ATENDIENDO
  // Abre el modal de nuevo con el mismo botón
  await expect(btnConsulta).toBeVisible()
  await btnConsulta.click()

  // Ahora el modal muestra "Marcar como atendido"
  await expect(page.getByTestId('btn-marcar-atendido')).toBeVisible()
  await page.getByTestId('btn-marcar-atendido').click()

  // Verifica el toast de éxito
  await expect(page.getByText('Ficha atendida exitosamente.')).toBeVisible()
})
