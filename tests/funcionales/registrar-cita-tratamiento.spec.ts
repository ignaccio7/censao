import { expect, test } from '@playwright/test'

test.describe('Programar Cita de Tratamiento', () => {
  test('Flujo completo para programar una nueva cita desde el historial de un tratamiento', async ({
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
    await page.locator('button[title="Ver detalle"]').first().click()

    // Verificamos que se haya cargado la página de perfil del paciente
    await expect(page).toHaveURL(/\/dashboard\/atencion\/pacientes\/.+/)

    // ── Paso 4: Navegar al historial del tratamiento (primer tratamiento) ────
    // En la tabla de tratamientos, buscamos el primer enlace de "Ver Detalle"
    await page
      .getByRole('link', { name: /Ver Detalle/i })
      .first()
      .click()

    // Verificamos que estemos en la vista de detalle
    await expect(page).toHaveURL(
      /\/dashboard\/atencion\/pacientes\/.+\/detalle\/.+/,
      { timeout: 15000 }
    )

    // ── Paso 5: Expandir el último acordeón de dosis ─────────────────────────
    // Los acordeones de TratamientoAccordion tienen en su nombre "Dosis #"
    const accordionBtn = page.getByRole('button', { name: /Dosis #/i }).last()
    await accordionBtn.click()

    // ── Paso 6: Hacer clic en "Programar Nueva Cita" ─────────────────────────
    await page.getByRole('button', { name: 'Programar Nueva Cita' }).click()

    // ── Paso 7: Esperar a que el modal sea visible ───────────────────────────
    // Buscamos el modal que esté visible y contenga el texto (usamos :visible porque showModal nativo no siempre pone el atributo 'open')
    const modal = page
      .locator('dialog:visible')
      .filter({ hasText: 'Programar Nueva Cita' })
      .first()
    await expect(modal).toBeVisible()

    // ── Paso 8: Seleccionar un turno (Mañana AM) ─────────────────────────────
    // Buscamos el select del turno dentro de ese modal
    await modal.locator('select').first().selectOption('AM')

    // ── Paso 9: Seleccionar un día válido en el calendario (Siguiente Mes) ───────
    // Primero hacemos clic en el botón para ir al mes siguiente
    await modal.locator('.rdp-button_next').click()

    // Luego buscamos un día del mes (no rdp-outside) que no esté deshabilitado (no rdp-disabled) ni oculto
    const validDayButton = modal
      .locator('.rdp-day:not(.rdp-disabled):not(.rdp-outside):not(.rdp-hidden)')
      .first()
    await validDayButton.click()

    // ── Paso 10: Hacer clic en el botón "Programar cita" ─────────────────────
    await modal.getByRole('button', { name: 'Programar cita' }).click()

    // ── Paso 11 (Validación): Verificar toast de éxito ───────────────────────
    await expect(
      page.getByText(/Cita programada para el/i).first()
    ).toBeVisible()
  })

  test('El botón Programar cita está deshabilitado si no se selecciona fecha', async ({
    page
  }) => {
    // Login
    await page.goto('http://localhost:3000/auth/ingresar')
    await page.locator('input[name="username"]').fill('enfermeria')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: 'Inicia sesión' }).click()
    await expect(page).toHaveURL('http://localhost:3000/dashboard')

    // Navegar y abrir historial del paciente
    await page.goto('http://localhost:3000/dashboard/atencion/pacientes')
    await page.locator('button[title="Ver detalle"]').first().click()
    await expect(page).toHaveURL(/\/dashboard\/atencion\/pacientes\/.+/)

    // Navegar al historial de un tratamiento
    await page
      .getByRole('link', { name: /Ver Detalle/i })
      .first()
      .click()
    await expect(page).toHaveURL(
      /\/dashboard\/atencion\/pacientes\/.+\/detalle\/.+/,
      { timeout: 15000 }
    )

    // Expandir acordeón
    await page
      .getByRole('button', { name: /Dosis #/i })
      .last()
      .click()

    // Abrir modal de nueva cita
    await page.getByRole('button', { name: 'Programar Nueva Cita' }).click()

    const modal = page
      .locator('dialog:visible')
      .filter({ hasText: 'Programar Nueva Cita' })
      .first()
    await expect(modal).toBeVisible()

    // Botón "Programar cita" debe estar deshabilitado porque la fecha inicia vacía
    const btnProgramar = modal.getByRole('button', { name: 'Programar cita' })
    await expect(btnProgramar).toBeDisabled()
  })
})
