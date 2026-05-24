import { expect, test } from "@playwright/test";

// Verifies the @media print rules added in CM-06. We can't statically check
// browser-applied print styles in jsdom, so this e2e emulates print media and
// asserts the documented behavior at the real-DOM layer.

test("print media hides the form chrome and submit button", async ({ page }) => {
  await page.goto("/classmap");

  // Sanity: the form is visible under screen media
  const form = page.locator('[data-slot="classmap-flow-form"]');
  await expect(form).toBeVisible();
  const submit = page.getByTestId("classmap-form-submit");
  await expect(submit).toBeVisible();

  // Switch to print
  await page.emulateMedia({ media: "print" });
  await expect(form).toBeHidden();
  await expect(submit).toBeHidden();
});

// NOTE: a second test that drove the form to a generated plan and checked
// the day-grid stacking (display:grid → block under print) was tried but the
// e2e form submit wasn't completing reliably (defaultValues from
// react-hook-form aren't reaching the uncontrolled DOM by the time
// Playwright clicks; explicit `fill()` didn't unblock it either). The
// day-grid stacking and per-result action row are pinned at the CSS source
// level by tests/unit/print-stylesheet.test.ts. Revisit when CM-05's
// loading/error states give us a deterministic submit hook.
