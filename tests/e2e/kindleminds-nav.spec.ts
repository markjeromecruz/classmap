import { expect, test } from "@playwright/test";

// TK-04: prove the static-export navigation actually works in a real browser.
// Unit tests already cover slots/data attributes per page; this spec
// asserts the *links* wire up correctly end-to-end, since the only thing
// holding the static demo together is `<Link>` href correctness.

test("landing → room → thread → back → back", async ({ page }) => {
  // 1. Landing
  await page.goto("/kindleminds");
  await expect(
    page.locator('[data-slot="kindleminds-landing"]'),
  ).toBeVisible();
  const grid = page.locator('[data-slot="rooms-grid"]');
  await expect(grid).toBeVisible();
  await expect(grid).toHaveAttribute("data-count", "5");

  // 2. Click into the Classical room
  const classicalCard = page.locator(
    '[data-slot="room-card"][data-room-slug="classical"]',
  );
  await expect(classicalCard).toBeVisible();
  await classicalCard.click();
  await expect(page).toHaveURL(/\/kindleminds\/rooms\/classical\/?$/);
  const room = page.locator('[data-slot="kindleminds-room"]');
  await expect(room).toBeVisible();
  await expect(room).toHaveAttribute("data-room-slug", "classical");

  // The room has at least one thread (matches demo-data invariant)
  const threadCards = page.locator(
    '[data-slot="thread-card"][data-room-slug="classical"]',
  );
  await expect(threadCards.first()).toBeVisible();

  // 3. Click the first thread
  const firstThreadId = await threadCards
    .first()
    .getAttribute("data-thread-id");
  expect(firstThreadId).toBeTruthy();
  await threadCards.first().click();
  await expect(page).toHaveURL(
    new RegExp(`/kindleminds/rooms/classical/${firstThreadId}/?$`),
  );
  const thread = page.locator('[data-slot="kindleminds-thread"]');
  await expect(thread).toBeVisible();
  await expect(thread).toHaveAttribute("data-thread-id", firstThreadId!);
  await expect(
    thread.locator('[data-slot="thread-title"]'),
  ).toBeVisible();

  // 4. Back link in the thread page returns to the room
  await page
    .getByRole("link", { name: /classical/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/kindleminds\/rooms\/classical\/?$/);
  await expect(
    page.locator('[data-slot="kindleminds-room"]'),
  ).toBeVisible();

  // 5. "all rooms" back link returns to landing
  await page.getByRole("link", { name: /all rooms/i }).click();
  await expect(page).toHaveURL(/\/kindleminds\/?$/);
  await expect(
    page.locator('[data-slot="kindleminds-landing"]'),
  ).toBeVisible();
});

// NOTE: 404 behavior for unknown room slugs / mismatched thread slugs is
// covered by the unit tests (`expect(...).rejects.toThrow()` against
// `notFound()`). In `next dev` those paths render a runtime error (500),
// not the static-export 404 that ships to Pages. Running this assertion
// would require `next build && next start`, which is out of scope here.
