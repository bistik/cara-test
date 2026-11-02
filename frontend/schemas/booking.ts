import { z } from "zod";

const required = (label: string) => z.string().trim().min(1, `${label} is required.`);

/**
 * Form-level schema for creating (and later editing) a booking. Field names
 * use snake_case to match the REST API's payload so the validated output can
 * be posted as-is.
 */
export const bookingFormSchema = z
  .object({
    customer_name: required("Customer name"),
    customer_email: z.email("Enter a valid email address."),
    rego: required("Rego"),
    service_bay: required("Service bay"),
    starts_at: required("Start time"),
    ends_at: required("End time"),
    // The status select is optional: leaving it untouched submits the default.
    status: z.enum(["pending", "confirmed", "cancelled"]).default("pending"),
    notes: z.string().trim().max(1000, "Notes must be at most 1000 characters.").optional(),
  })
  .check((ctx) => {
    if (ctx.value.ends_at <= ctx.value.starts_at) {
      ctx.issues.push({
        code: "custom",
        input: ctx.value.ends_at,
        path: ["ends_at"],
        message: "End time must be after the start time.",
      });
    }
  });

/** Input values of the booking form (before defaults are applied). */
export type BookingFormValues = z.input<typeof bookingFormSchema>;

/** Output values once defaults (e.g. `status`) have been applied. */
export type BookingFormOutput = z.output<typeof bookingFormSchema>;
