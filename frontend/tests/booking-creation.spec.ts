import { expect, test } from "@playwright/test";

/**
 * Creates a booking through the /bookings/new form, then re-submits the form
 * with the exact same service bay and time window and expects the backend
 * (HTTP 422: "The service bay already has an active booking.") to reject it:
 * the form must stay open and surface the error inline.
 *
 * All identifying values are generated per run and local to this test, so it
 * never collides with other bookings or with its own previous runs.
 */
test("creates a booking, then rejects another in the same service bay", async ({
  page,
}) => {
  const STAMP = Date.now();
  const BAY = `E2E-BAY-${STAMP}`;
  const EMAIL = `e2e-${STAMP}@example.com`;

  /** Tomorrow at 10:00/11:00 local time, in `datetime-local` format. */
  function tomorrow(hour: number) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(hour, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  const STARTS_AT = tomorrow(10);
  const ENDS_AT = tomorrow(11);

  // --- Part 1: create a booking ------------------------------------------
  await page.goto("/bookings/new");

  await page.getByLabel("Customer", { exact: true }).fill("E2E Customer");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Rego").fill(`E2E${STAMP % 100000}`);
  await page.getByLabel("Service bay").fill(BAY);
  await page.getByLabel("Starts").fill(STARTS_AT);
  await page.getByLabel("Ends").fill(ENDS_AT);

  await page.getByRole("button", { name: "Create booking" }).click();

  // Success: back to the listing with the success toast.
  await expect(page).toHaveURL(/\/bookings$/);
  await expect(page.getByText("Booking created")).toBeVisible();

  // --- Part 2: same bay, same window -> rejected --------------------------
  await page.goto("/bookings/new");

  await page.getByLabel("Customer", { exact: true }).fill("E2E Duplicate");
  await page.getByLabel("Email").fill(`dup-${EMAIL}`);
  await page.getByLabel("Rego").fill(`D2E${STAMP % 100000}`);
  await page.getByLabel("Service bay").fill(BAY); // same bay as part 1
  await page.getByLabel("Starts").fill(STARTS_AT);
  await page.getByLabel("Ends").fill(ENDS_AT);

  await page.getByRole("button", { name: "Create booking" }).click();

  // Must NOT navigate away to /bookings: the form stays open with an error.
  await expect(page).not.toHaveURL(/\/bookings$/);
  await expect(
    page.getByText("The service bay already has an active booking.").first(),
  ).toBeVisible();

  // The backend 422 surfaces as an inline field error next to the bay field.
  await expect(
    page
      .locator("em[role='alert']")
      .filter({ hasText: /service bay/i })
      .first(),
  ).toBeVisible();
});
