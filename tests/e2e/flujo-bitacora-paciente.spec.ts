// tests/e2e/flujo-bitacora-paciente.spec.ts
import { test, expect } from '@playwright/test'
import { loginWithUser } from '../helpers/login'

// ── Datos dinámicos del paciente a crear ──────────────────────────────────────
const timestamp = Date.now()
const CI_TEST = timestamp.toString().slice(-8) // 8 dígitos únicos, solo números
const NOMBRE_TEST = 'Paciente' // solo letras
const PATERNO_TEST = 'Autoprueba'

test.setTimeout(90000)

test('Flujo completo: Crear paciente → Registrar tratamiento + cita → Verificar bitácora', async ({
  page
}) => {
  // ════════════════════════════════════════════════════════════════════════════
  // FASE 1 — ADMISIÓN (doctor.fichas): Crear paciente nuevo
  // ════════════════════════════════════════════════════════════════════════════
  await loginWithUser(page, 'doctor.fichas')

  // Navegar al formulario de creación de paciente
  await page.goto('http://localhost:3000/dashboard/atencion/pacientes/crear')

  // Llenar campos usando name= (como en los tests funcionales anteriores)
  await page.locator('input[name="ci"]').fill(CI_TEST)
  await page.locator('input[name="nombres"]').fill(NOMBRE_TEST)
  await page.locator('input[name="paterno"]').fill(PATERNO_TEST)
  await page.locator('input[name="fecha_nacimiento"]').fill('1990-01-01')

  // Enviar formulario
  await page.getByRole('button', { name: 'Registrar Paciente' }).click()

  // Validar redirección al listado y toast de éxito
  await expect(page).toHaveURL(
    'http://localhost:3000/dashboard/atencion/pacientes',
    { timeout: 15000 }
  )
  await expect(page.getByText(/creado exitosamente/i).first()).toBeVisible()

  // Logout — ir a otra página que requiera login para invalidar sesión
  await loginWithUser(page, 'enfermeria')

  // ════════════════════════════════════════════════════════════════════════════
  // FASE 2 — ENFERMERÍA: Buscar paciente, registrar tratamiento y programar cita
  // ════════════════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:3000/dashboard/atencion/pacientes')

  // Buscar al paciente por su CI dinámico en el InputSearch (id="search")
  await page.locator('input#search').fill(CI_TEST)

  // Esperar el debounce de 500ms + carga de resultados
  await page.waitForTimeout(1000)

  // Hacer clic en "Ver detalle" del paciente encontrado
  await page.locator('button[title="Ver detalle"]').first().click()
  await expect(page).toHaveURL(/\/dashboard\/atencion\/pacientes\/.+/, {
    timeout: 10000
  })

  // Extraer el UUID del paciente de la URL actual para navegar directamente
  const pacienteUrl = page.url()
  const pacienteUuid = pacienteUrl.split('/').pop()!

  // Navegar directamente a la ruta de crear tratamiento con el UUID obtenido
  await page.goto(
    `http://localhost:3000/dashboard/tratamientos/${pacienteUuid}/crear`
  )
  await expect(page).toHaveURL(/\/dashboard\/tratamientos\/.+\/crear/, {
    timeout: 10000
  })

  // Seleccionar primera vacuna y primera dosis válidas (índice 1 = primera opción real)
  await page.locator('select').first().selectOption({ index: 1 })
  await page.locator('select').nth(1).selectOption({ index: 1 })

  // Agregar al carrito
  await page.getByRole('button', { name: '+ Agregar al registro' }).click()
  await expect(page.getByText(/agregada/i).first()).toBeVisible()

  // Registrar todos los tratamientos del carrito
  await page.getByRole('button', { name: /Registrar todo/i }).click()

  // Validar toast de éxito del registro
  await expect(
    page.getByText(/tratamiento\(s\) registrado\(s\)/i).first()
  ).toBeVisible({ timeout: 15000 })

  // El sistema redirige al listado de pacientes después del registro
  await expect(page).toHaveURL(
    'http://localhost:3000/dashboard/atencion/pacientes',
    { timeout: 10000 }
  )

  // Navegar directamente al perfil del paciente para ir al detalle del tratamiento
  await page.goto(
    `http://localhost:3000/dashboard/atencion/pacientes/${pacienteUuid}`
  )
  await page.waitForLoadState('networkidle')

  // Ir al detalle del tratamiento recién registrado → primer enlace "Ver Detalle"
  await page
    .getByRole('link', { name: /Ver Detalle/i })
    .first()
    .click()
  await expect(page).toHaveURL(
    /\/dashboard\/atencion\/pacientes\/.+\/detalle\/.+/,
    { timeout: 10000 }
  )

  // Expandir el último acordeón de dosis disponible
  await page
    .getByRole('button', { name: /Dosis #/i })
    .last()
    .click()

  // Abrir modal "Programar Nueva Cita"
  await page.getByRole('button', { name: 'Programar Nueva Cita' }).click()

  // Esperar que el modal esté visible
  const modal = page
    .locator('dialog:visible')
    .filter({ hasText: 'Programar Nueva Cita' })
    .first()
  await expect(modal).toBeVisible()

  // Avanzar al mes siguiente en el DayPicker
  await modal.locator('.rdp-button_next').click()

  // Seleccionar el primer día hábil (no deshabilitado, no outside, no oculto)
  const validDay = modal
    .locator('.rdp-day:not(.rdp-disabled):not(.rdp-outside):not(.rdp-hidden)')
    .first()
  await validDay.click()

  // Confirmar la cita
  await modal.getByRole('button', { name: 'Programar cita' }).click()

  // Validar toast de cita programada
  await expect(page.getByText(/Cita programada para el/i).first()).toBeVisible({
    timeout: 10000
  })

  // ════════════════════════════════════════════════════════════════════════════
  // FASE 3 — PACIENTE: Verificar bitácora personal del tratamiento
  // ════════════════════════════════════════════════════════════════════════════
  // El username Y password del paciente = su CI (auto-generado por el sistema)
  // NO usamos loginWithUser porque ese helper tiene '123' hardcodeado
  await page.goto('http://localhost:3000/auth/ingresar')
  await page.locator('input[name="username"]').fill(CI_TEST)
  await page.locator('input[name="password"]').fill(CI_TEST)
  await page.getByRole('button', { name: 'Inicia sesión' }).click()
  await page.waitForURL('**/dashboard', { timeout: 15000 })

  // Navegar a la vista de mis tratamientos
  await page.goto('http://localhost:3000/dashboard/paciente/tratamientos')
  await page.waitForLoadState('networkidle')

  // Verificar que aparezca el tratamiento en la tabla
  // El nombre de la vacuna debería estar visible en alguna celda
  await expect(page.locator('.actions a').first()).toBeVisible({
    timeout: 10000
  })

  // Hacer clic en el ícono de ojo (IconEye) para ir a la bitácora
  await page.locator('.actions a').first().click()

  // Verificar que navega a la bitácora del tratamiento
  await expect(page).toHaveURL(/\/dashboard\/paciente\/tratamientos\/.+/, {
    timeout: 10000
  })

  // ── Validaciones en el timeline de la bitácora ────────────────────────────
  // El título del tratamiento tiene formato: "Tratamiento: <nombre vacuna>"
  await expect(page.getByText(/Tratamiento:/i).first()).toBeVisible()

  // Debe aparecer el estado EN_CURSO en el subtítulo del evento de tratamiento
  await expect(page.getByText(/EN_CURSO/i).first()).toBeVisible()

  // Debe aparecer "Cita programada" como título del evento de cita en el timeline
  await expect(page.getByText(/Cita programada/i).first()).toBeVisible()
})
