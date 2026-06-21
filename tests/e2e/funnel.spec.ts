import { expect, test } from "@playwright/test";

async function startRun(page: import("@playwright/test").Page, simulator: "queen" | "napoleon") {
  await page.goto(`/${simulator}`);
  await page.getByRole("link", { name: /start free|begin free/i }).click();
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/runs") && response.status() < 400,
  );
  await page.getByRole("button", { name: "Begin" }).click();
  await responsePromise;
  await page.waitForLoadState("domcontentloaded");
  await expect(
    page.getByRole("button", {
      name: simulator === "queen" ? /protect/i : /serve France/i,
    }),
  ).toBeVisible();
}

async function clickChoices(page: import("@playwright/test").Page, labels: RegExp[]) {
  for (const [index, label] of labels.entries()) {
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/choice") && response.status() < 400,
    );
    await page.getByRole("button", { name: label }).click();
    await responsePromise;
    await page.waitForLoadState("domcontentloaded");
    const nextLabel = labels[index + 1];
    if (nextLabel) {
      await expect(page.getByRole("button", { name: nextLabel })).toBeVisible();
    }
  }
}

test("Queen mobile free funnel reaches the current-run paywall", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startRun(page, "queen");
  await clickChoices(page, [/protect/i, /public trial/i, /break the seal/i, /torn envelope/i, /face the dawn/i]);

  await expect(page).toHaveURL(/\/queen\/unlock\//);
  await expect(page.getByRole("heading", { name: /complete your reign/i })).toBeVisible();
  await expect(page.getByText(/new campaign or replay requires a separate payment/i)).toBeVisible();
});

test("Napoleon mobile free funnel reaches the current-run paywall", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startRun(page, "napoleon");
  await clickChoices(page, [/serve France/i, /turn their flank/i, /pocket the dispatch/i, /listen without answering/i, /take command/i]);

  await expect(page).toHaveURL(/\/napoleon\/unlock\//);
  await expect(page.getByRole("heading", { name: /complete your campaign/i })).toBeVisible();
});

test("mock checkout returns to the first paid Queen scene and refresh restores it", async ({ page }) => {
  await startRun(page, "queen");
  await clickChoices(page, [/protect/i, /public trial/i, /break the seal/i, /torn envelope/i, /face the dawn/i]);

  await page.getByRole("button", { name: /continue my reign/i }).click();
  await expect(page).toHaveURL(/\/queen\/return\?runId=/);
  await page.getByRole("link", { name: /resume the throne/i }).click();
  await expect(page.getByRole("heading", { name: /war council/i })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: /war council/i })).toBeVisible();
});

for (const viewport of [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]) {
  test(`Queen landing has no horizontal overflow at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/queen");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );

    expect(overflow).toBeLessThanOrEqual(1);
  });
}
