import { expect, test } from "@playwright/test";

test("registers a customer and vehicle, then rejects a duplicate plate", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .getByLabel("Correo electrónico")
    .fill("admin@opengarageflow.local");
  await page.getByLabel("Contraseña").fill("admin");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL("/");

  const suffix = Date.now().toString();
  const customerName = `E2E${suffix}`;
  const plate = `E2E${suffix.slice(-6)}`;

  await page.goto("/customers");
  const customerForm = page
    .getByRole("heading", { name: "Registrar cliente" })
    .locator("..")
    .locator("form");
  await customerForm.getByLabel("Nombre").fill(customerName);
  await customerForm.getByLabel("Apellido").fill("Prueba");
  await customerForm.getByLabel("Teléfono").fill("3001234567");
  await customerForm.getByRole("button", { name: "Registrar cliente" }).click();
  await expect(customerForm.getByRole("status")).toHaveText(
    "Cliente registrado.",
  );

  await page.goto("/vehicles");
  const vehicleForm = page
    .getByRole("heading", { name: "Registrar vehículo" })
    .locator("..")
    .locator("form");
  await vehicleForm
    .getByLabel("Propietario")
    .selectOption({ label: `${customerName} Prueba` });
  await vehicleForm.getByLabel("Placa").fill(plate);
  await vehicleForm.getByLabel("Marca").fill("Toyota");
  await vehicleForm.getByLabel("Modelo").fill("Corolla");
  await vehicleForm.getByRole("button", { name: "Registrar vehículo" }).click();
  await expect(vehicleForm.getByRole("status")).toHaveText(
    "Vehículo registrado.",
  );

  await vehicleForm
    .getByLabel("Propietario")
    .selectOption({ label: `${customerName} Prueba` });
  await vehicleForm.getByLabel("Placa").fill(plate);
  await vehicleForm.getByLabel("Marca").fill("Toyota");
  await vehicleForm.getByLabel("Modelo").fill("Yaris");
  await vehicleForm.getByRole("button", { name: "Registrar vehículo" }).click();
  await expect(vehicleForm.getByRole("alert")).toHaveText(
    "Ya existe un vehículo con esa placa.",
  );
});

test("customer and vehicle filter actions have icons and preserve their behavior", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .getByLabel("Correo electrónico")
    .fill("admin@opengarageflow.local");
  await page.getByLabel("Contraseña").fill("admin");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL("/");

  await page.goto("/customers");
  const customerFilters = page.locator("form.list-filters");
  const customerApply = customerFilters.getByRole("button", {
    name: "Aplicar",
  });
  const customerClear = customerFilters.getByRole("link", { name: "Limpiar" });
  const customerExport = customerFilters.getByRole("link", {
    name: "Exportar CSV",
  });
  await expect(customerApply.locator('svg[aria-hidden="true"]')).toBeVisible();
  await expect(customerClear.locator('svg[aria-hidden="true"]')).toBeVisible();
  await expect(customerExport.locator('svg[aria-hidden="true"]')).toBeVisible();

  await customerFilters.getByLabel("Buscar por nombre o teléfono").fill("E2E");
  await customerFilters.getByLabel("Ordenar por").selectOption("nombre");
  await customerFilters.getByLabel("Dirección").selectOption("desc");
  await customerApply.click();
  await expect(page).toHaveURL(/q=E2E/);
  const customerExportUrl = new URL(
    (await customerExport.getAttribute("href"))!,
    page.url(),
  );
  expect(customerExportUrl.pathname).toBe("/api/exports/customers");
  expect(customerExportUrl.searchParams.get("q")).toBe("E2E");
  expect(customerExportUrl.searchParams.get("sort")).toBe("nombre");
  expect(customerExportUrl.searchParams.get("direction")).toBe("desc");
  expect(customerExportUrl.searchParams.has("page")).toBe(false);

  await customerClear.click();
  await expect(page).toHaveURL(/\/customers$/);
  await expect(
    customerFilters.getByLabel("Buscar por nombre o teléfono"),
  ).toHaveValue("");
  await expect(customerFilters.getByLabel("Ordenar por")).toHaveValue(
    "apellido",
  );
  await expect(customerFilters.getByLabel("Dirección")).toHaveValue("asc");

  await page.goto("/vehicles");
  const vehicleFilters = page.locator("form.list-filters");
  const vehicleApply = vehicleFilters.getByRole("button", { name: "Aplicar" });
  const vehicleClear = vehicleFilters.getByRole("link", { name: "Limpiar" });
  const vehicleExport = vehicleFilters.getByRole("link", {
    name: "Exportar CSV",
  });
  await expect(vehicleApply.locator('svg[aria-hidden="true"]')).toBeVisible();
  await expect(vehicleClear.locator('svg[aria-hidden="true"]')).toBeVisible();
  await expect(vehicleExport.locator('svg[aria-hidden="true"]')).toBeVisible();

  const brand = await vehicleFilters
    .locator('select[name="marca"] option')
    .nth(1)
    .getAttribute("value");
  const customerId = await vehicleFilters
    .locator('select[name="clienteId"] option')
    .nth(1)
    .getAttribute("value");
  if (!brand || !customerId)
    throw new Error("Los datos semilla deben incluir marcas y clientes.");

  await vehicleFilters
    .getByLabel("Buscar placa, marca, modelo o propietario")
    .fill("E2E");
  await vehicleFilters.locator('select[name="marca"]').selectOption(brand);
  await vehicleFilters
    .locator('select[name="clienteId"]')
    .selectOption(customerId);
  await vehicleFilters.getByLabel("Ordenar por").selectOption("marca");
  await vehicleFilters.getByLabel("Dirección").selectOption("desc");
  await vehicleApply.click();
  await expect(page).toHaveURL(/q=E2E/);
  const vehicleExportUrl = new URL(
    (await vehicleExport.getAttribute("href"))!,
    page.url(),
  );
  expect(vehicleExportUrl.pathname).toBe("/api/exports/vehicles");
  expect(vehicleExportUrl.searchParams.get("q")).toBe("E2E");
  expect(vehicleExportUrl.searchParams.get("marca")).toBe(brand);
  expect(vehicleExportUrl.searchParams.get("clienteId")).toBe(customerId);
  expect(vehicleExportUrl.searchParams.get("sort")).toBe("marca");
  expect(vehicleExportUrl.searchParams.get("direction")).toBe("desc");
  expect(vehicleExportUrl.searchParams.has("page")).toBe(false);

  await vehicleClear.click();
  await expect(page).toHaveURL(/\/vehicles$/);
  await expect(
    vehicleFilters.getByLabel("Buscar placa, marca, modelo o propietario"),
  ).toHaveValue("");
  await expect(vehicleFilters.locator('select[name="marca"]')).toHaveValue("");
  await expect(vehicleFilters.locator('select[name="clienteId"]')).toHaveValue(
    "",
  );
  await expect(vehicleFilters.getByLabel("Ordenar por")).toHaveValue("placa");
  await expect(vehicleFilters.getByLabel("Dirección")).toHaveValue("asc");
});

test("classic interface remains usable on desktop and mobile", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/login");
  await expect(page.getByLabel("Correo electrónico")).toBeFocused();

  await page
    .getByLabel("Correo electrónico")
    .fill("admin@opengarageflow.local");
  await page.getByLabel("Contraseña").fill("admin");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL("/");

  for (const path of ["/", "/customers", "/vehicles", "/orders", "/users"]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    const overflow = await page.evaluate(() => ({
      document:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
      offenders: [...document.querySelectorAll<HTMLElement>("*")]
        .filter(
          (element) =>
            element.getBoundingClientRect().right >
            document.documentElement.clientWidth + 1,
        )
        .slice(0, 8)
        .map((element) => ({
          tag: element.tagName,
          className: element.className,
          right: Math.round(element.getBoundingClientRect().right),
          text: element.textContent?.trim().slice(0, 40),
          href:
            element instanceof HTMLAnchorElement
              ? element.getAttribute("href")
              : null,
        })),
    }));
    expect(
      overflow.document,
      `document overflow at ${path}: ${JSON.stringify(overflow.offenders)}`,
    ).toBeLessThanOrEqual(1);
    expect(overflow.body, `body overflow at ${path}`).toBeLessThanOrEqual(1);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/customers", "/vehicles", "/orders", "/users"]) {
    await page.goto(path);
    await expect(
      page.getByRole("button", { name: "Abrir menú" }),
    ).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    const overflow = await page.evaluate(() => ({
      document:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    expect(
      overflow.document,
      `document overflow at ${path}`,
    ).toBeLessThanOrEqual(1);
    expect(overflow.body, `body overflow at ${path}`).toBeLessThanOrEqual(1);
  }

  await page.goto("/customers");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeVisible();
  await expect(page.locator(".mobile-menu-toggle")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(page.locator(".mobile-menu-toggle")).toHaveAttribute(
    "aria-label",
    "Cerrar menú",
  );
});
