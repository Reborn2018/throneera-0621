import { expect, test } from "@playwright/test";

type QueenVariant = "legacy" | "crown" | "betrayal";

declare global {
  interface Window {
    __recordFbqCall: (...args: unknown[]) => void;
  }
}

async function startRun(
  page: import("@playwright/test").Page,
  simulator: "queen" | "napoleon",
  variant?: QueenVariant,
) {
  const path = simulator === "queen" && variant ? `/queen?variant=${variant}` : `/${simulator}`;
  await page.goto(path);
  await page
    .getByRole("link", {
      name:
        simulator === "queen"
          ? /claim the throne|take back the crown|refuse the abdication/i
          : /begin the campaign/i,
    })
    .click();
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/runs") && response.status() < 400,
  );
  await page.getByRole("button", { name: /begin the first turn/i }).click();
  await responsePromise;
  await page.waitForLoadState("domcontentloaded");
  await expect(
    page.getByRole("button", {
      name:
        simulator === "queen"
          ? /protect|kneel slowly|lift your glass/i
          : /serve France/i,
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
  await startRun(page, "queen", "legacy");
  await clickChoices(page, [/protect/i, /public trial/i, /break the seal/i, /torn envelope/i, /face the dawn/i]);

  await expect(page).toHaveURL(/\/queen\/unlock\//);
  await expect(page.getByRole("heading", { name: /finish the reign your choices started/i })).toBeVisible();
  await expect(page.getByText(/one-time unlock for this saved story/i)).toBeVisible();
});

test("Queen ad funnel hides Napoleon entry points before paywall", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/queen?variant=crown");
  await expect(page.getByRole("link", { name: /napoleon/i })).toHaveCount(0);
  await expect(page.getByText(/Try Napoleon Simulator/i)).toHaveCount(0);

  await page.getByRole("link", { name: /take back the crown/i }).click();
  await expect(page.getByRole("link", { name: /napoleon/i })).toHaveCount(0);

  await page.getByRole("button", { name: /begin the first turn/i }).click();
  await expect(page.getByRole("button", { name: /kneel slowly/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /napoleon/i })).toHaveCount(0);
});

for (const variant of ["legacy", "crown", "betrayal"] as const) {
  test(`Queen ${variant} landing keeps price and story length hidden`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/queen?variant=${variant}`);

    await expect(page.getByText(/\$7\.99|full campaign|free turns|total story turns|endings/i)).toHaveCount(0);
    await expect(page.getByText(/begin inside the crisis/i)).toBeVisible();
  });
}

test("Meta pixel fires InitiateCheckout only after the checkout button click", async ({ page }) => {
  const fbqCalls: unknown[][] = [];
  await page.exposeFunction("__recordFbqCall", (...args: unknown[]) => {
    fbqCalls.push(args);
  });
  await page.addInitScript(() => {
    window.fbq = (action, eventName, params) => {
      void window.__recordFbqCall(action, eventName, params);
    };
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await startRun(page, "queen", "crown");
  await clickChoices(page, [
    /kneel slowly/i,
    /amnesty/i,
    /address the crowd/i,
    /borrow against/i,
    /step over/i,
  ]);

  expect(fbqCalls.some((call) => call[0] === "track" && call[1] === "InitiateCheckout")).toBe(false);

  await page.getByRole("button", { name: /reclaim my crown/i }).click();
  await expect
    .poll(() => fbqCalls.filter((call) => call[0] === "track" && call[1] === "InitiateCheckout").length)
    .toBe(1);
});

test("Queen crown variant mobile free funnel reaches the current-run paywall", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startRun(page, "queen", "crown");
  await clickChoices(page, [
    /kneel slowly/i,
    /amnesty/i,
    /address the crowd/i,
    /borrow against/i,
    /step over/i,
  ]);

  await expect(page).toHaveURL(/\/queen\/unlock\/.*variant=crown/);
  await expect(page.getByRole("heading", { name: /do not let her keep your crown/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /reclaim my crown/i })).toBeVisible();
});

test("Queen betrayal variant mobile free funnel reaches the current-run paywall", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startRun(page, "queen", "betrayal");
  await clickChoices(page, [
    /lift your glass/i,
    /read every line/i,
    /enter alone/i,
    /burn the draft/i,
    /enter the council/i,
  ]);

  await expect(page).toHaveURL(/\/queen\/unlock\/.*variant=betrayal/);
  await expect(page.getByRole("heading", { name: /make the betrayal answer to you/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /turn the betrayal back/i })).toBeVisible();
});

test("Napoleon mobile free funnel reaches the current-run paywall", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startRun(page, "napoleon");
  await clickChoices(page, [/serve France/i, /turn their flank/i, /pocket the dispatch/i, /listen without answering/i, /take command/i]);

  await expect(page).toHaveURL(/\/napoleon\/unlock\//);
  await expect(page.getByRole("heading", { name: /complete your campaign/i })).toBeVisible();
});

test("mock checkout returns to the first paid Queen scene and refresh restores it", async ({ page }) => {
  await startRun(page, "queen", "legacy");
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
    await page.goto("/queen?variant=legacy");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );

    expect(overflow).toBeLessThanOrEqual(1);
  });
}
