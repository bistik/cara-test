"use server";

import { revalidatePath } from "next/cache";

import { ApiError, api } from "@/lib/api";
import {
  bookingFormSchema,
  type BookingFormOutput,
  type BookingFormValues,
} from "@/schemas/booking";

export type CreateBookingResult =
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

/**
 * Create a booking via the REST API. Returns a result object instead of
 * redirecting so the client can toast and redirect after success, and can
 * surface 422 field errors inline in the form.
 */
export async function createBooking(
  values: BookingFormValues,
): Promise<CreateBookingResult> {
  // Re-validate on the server; never trust values straight from the client.
  const parsed = bookingFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [
          issue.path[0] as keyof BookingFormValues,
          issue.message,
        ]),
      ),
    };
  }

  const payload: Record<string, unknown> = { ...parsed.data };
  // The API stores timestamps; `datetime-local` inputs are timezone-less.
  payload.starts_at = toIso(parsed.data.starts_at);
  payload.ends_at = toIso(parsed.data.ends_at);
  // An empty notes field means "no notes" to the API.
  if (payload.notes === "") {
    payload.notes = null;
  }

  try {
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

export type { BookingFormOutput };
