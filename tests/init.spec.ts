import { expect, test } from '@playwright/test'

test('Is Runnning application', async ({ page }) => {
  // 1. Navega a la pagina de inicio
  await page.goto('http://localhost:3000')

  // 2. Buscamos el titulo h1 que tenga el contenido "CENSAO - Centro de salud Alto Obrajes"
  await expect(page).toHaveTitle(/CENSAO - Centro de salud Alto Obrajes/)
})
