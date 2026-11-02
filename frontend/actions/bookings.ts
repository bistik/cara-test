"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";

import { ApiError, api } from "@/api/client";
import {
  bookingFormSchema,
  type BookingFormOutput,
  type BookingFormValues,
} from "@/schemas/booking";

export type BookingFormResult =
  | { ok: true }
  | {
      ok: false;
      /** Human-readable message for the toast. */
      message: string;
      /** Field-level messages from the API's 422 response, keyed by field name. */
      fieldErrors?: Partial<Record<keyof BookingFormValues, string>>;
    };

/** Laravel validation responses carry `{ message, errors: Record<string, string[]> }`. */
type LaravelValidationBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

/** Collapse a Laravel `errors` object into one message per field. */
function fieldErrorsFrom(body: unknown) {
  const { errors } = (body ?? {}) as LaravelValidationBody;
  const fieldErrors: Partial<Record<keyof BookingFormValues, string>> = {};

  if (errors) {
    for (const [key, messages] of Object.entries(errors)) {
      fieldErrors[key as keyof BookingFormValues] = messages[0];
    }
  }

  return fieldErrors;
}

/** Convert a `datetime-local` value (or other parseable string) to ISO 8601. */
function toIso(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

/** Convert validated form values into the REST API's payload shape. */
function payloadFrom(values: BookingFormOutput): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...values };
  // The API stores timestamps; `datetime-local` inputs are timezone-less.
  payload.starts_at = toIso(values.starts_at);
  payload.ends_at = toIso(values.ends_at);
  // An empty notes field means "no notes" to the API.
  if (payload.notes === "") {
    payload.notes = null;
  }

  return payload;
}

/** Collapse failed form validation into the inline field error result. */
function invalidResult(error: z.ZodError): BookingFormResult {
  return {
    ok: false,
    message: "Please fix the highlighted fields.",
    fieldErrors: Object.fromEntries(
      error.issues.map((issue) => [
        issue.path[0] as keyof BookingFormValues,
        issue.message,
      ]),
    ),
  };
}

/**
 * Re-validate on the server; never trust values straight from the client.
 * Returns either the validated values or the inline field error result.
 */
function parseFormValues(
  values: BookingFormValues,
):
  | { ok: true; data: BookingFormOutput }
  | { ok: false; result: BookingFormResult } {
  const parsed = bookingFormSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, result: invalidResult(parsed.error) };
  }

  return { ok: true, data: parsed.data };
}

/**
 * Create a booking via the REST API. Returns a result object instead of
 * redirecting so the client can toast and redirect after success, and can
 * surface 422 field errors inline in the form.
 */
export async function createBooking(
  values: BookingFormValues,
): Promise<BookingFormResult> {
  const parsed = parseFormValues(values);

  if (!parsed.ok) {
    return parsed.result;
  }

  try {
    const payload = payloadFrom(parsed.data);
    // The create endpoint has no status field; the API defaults new
    // bookings to `pending` (status is only editable on update).
    delete payload.status;
    await api.post("/api/v1/bookings", payload);
    // Ensure the listing page picks up the new booking when we redirect back.
    revalidatePath("/bookings");

    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError && error.response.status === 422) {
      return {
        ok: false,
        message: "Please fix the highlighted fields.",
        fieldErrors: fieldErrorsFrom(error.body),
      };
    }

    if (error instanceof ApiError) {
      return {
        ok: false,
        message: `Could not create the booking (${error.response.status}).`,
      };
    }

    return { ok: false, message: "Could not reach the API. Try again." };
  }
}

/**
 * Update a booking via the REST API. Same result-object contract as
 * {@link createBooking}: the client toasts and redirects after success,
 * and surfaces 422 field errors inline in the form.
 */
export async function updateBooking(
  bookingId: number,
  values: BookingFormValues,
): Promise<BookingFormResult> {
  const parsed = parseFormValues(values);

  if (!parsed.ok) {
    return parsed.result;
  }

  try {
    await api.put(`/api/v1/bookings/${bookingId}`, payloadFrom(parsed.data));
    // Ensure the listing and detail pages reflect the edited booking.
    revalidatePath("/bookings");
    revalidatePath(`/bookings/${bookingId}`);

    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError && error.response.status === 422) {
      return {
        ok: false,
        message: "Please fix the highlighted fields.",
        fieldErrors: fieldErrorsFrom(error.body),
      };
    }

    if (error instanceof ApiError) {
      return {
        ok: false,
        message: `Could not update the booking (${error.response.status}).`,
      };
    }

    return { ok: false, message: "Could not reach the API. Try again." };
  }
}

export type BookingDeleteResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Delete a booking via the REST API. Returns a result object instead of
 * throwing so the client can toast the outcome. The listing is revalidated
 * afterwards so the deleted row disappears from the table.
 */
export async function deleteBooking(
  bookingId: number,
): Promise<BookingDeleteResult> {
  try {
    await api.delete(`/api/v1/bookings/${bookingId}`);
    // Ensure the listing (and detail page, in case it is cached) reflects
    // the deletion.
    revalidatePath("/bookings");
    revalidatePath(`/bookings/${bookingId}`);

    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        message: `Could not delete the booking (${error.response.status}).`,
      };
    }

    return { ok: false, message: "Could not reach the API. Try again." };
  }
}

export type { BookingFormOutput };
