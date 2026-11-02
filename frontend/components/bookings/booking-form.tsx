"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createBooking } from "@/actions/bookings";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/bookings";
import { bookingFormSchema, type BookingFormValues } from "@/schemas/booking";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_VALUES: BookingFormValues = {
  customer_name: "",
  customer_email: "",
  rego: "",
  service_bay: "",
  starts_at: "",
  ends_at: "",
  status: "pending",
  notes: "",
};

type FieldErrors = Partial<Record<keyof BookingFormValues, string>>;

/** TanStack Form errors are strings (`min` etc.) or Standard Schema issues. */
function firstError(errors: unknown[]): string | undefined {
  for (const error of errors) {
    const message =
      typeof error === "string"
        ? error
        : (error as { message?: string } | undefined)?.message;

    if (message) {
      return message;
    }
  }

  return undefined;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Lays out a labelled control with an inline validation message beneath it.
 */
function FieldRow({
  label,
  htmlFor,
  className,
  children,
  error,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className={cn(`flex flex-col gap-1.5`, className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <em role="alert" className="text-xs text-destructive">
          {error}
        </em>
      )}
    </div>
  );
}

/**
 * Booking create/edit form backed by TanStack Form, validated with zod.
 * Submitted via the `createBooking` server action, which POSTs to the REST API.
 */
export function BookingForm({
  initialValues = DEFAULT_VALUES,
}: {
  /** Pre-filled values, e.g. when reusing this form for `/bookings/<id>/edit`. */
  initialValues?: BookingFormValues;
}) {
  const router = useRouter();
  // Field-level messages returned by the API's 422 response, shown inline.
  const [serverFieldErrors, setServerFieldErrors] = useState<FieldErrors>({});

  const form = useForm({
    defaultValues: initialValues,
    validators: { onSubmit: bookingFormSchema },
    onSubmit: async ({ value }) => {
      setServerFieldErrors({});

      const result = await createBooking(value);

      if (!result.ok) {
        toast.error(result.message);
        if (result.fieldErrors) {
          setServerFieldErrors(result.fieldErrors);
        }
        return;
      }

      toast.success("Booking created", {
        description: "The new booking was saved.",
      });
      // Reset before leaving: the route is static, so the client router cache
      // restores this component's state on the next visit instead of remounting.
      form.reset();
      router.push("/bookings");
    },
  });

  /** Resolve a field's inline message: zod errors first, then API 422 errors. */
  const errorsFor = (name: keyof BookingFormValues) =>
    firstError(form.getFieldMeta(name)?.errors ?? []) ??
    serverFieldErrors[name];

  return (
    <form
      className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field name="rego">
        {(field) => (
          <FieldRow label="Rego" htmlFor="rego" error={errorsFor("rego")}>
            <Input
              id="rego"
              className="font-mono"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </FieldRow>
        )}
      </form.Field>

      <form.Field name="customer_name">
        {(field) => (
          <FieldRow
            label="Customer"
            htmlFor="customer_name"
            error={errorsFor("customer_name")}
          >
            <Input
              id="customer_name"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </FieldRow>
        )}
      </form.Field>

      <form.Field name="customer_email">
        {(field) => (
          <FieldRow
            label="Email"
            htmlFor="customer_email"
            error={errorsFor("customer_email")}
          >
            <Input
              id="customer_email"
              type="email"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </FieldRow>
        )}
      </form.Field>

      <form.Field name="service_bay">
        {(field) => (
          <FieldRow
            label="Service bay"
            htmlFor="service_bay"
            error={errorsFor("service_bay")}
          >
            <Input
              id="service_bay"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </FieldRow>
        )}
      </form.Field>

      <form.Field name="starts_at">
        {(field) => (
          <FieldRow
            label="Starts"
            htmlFor="starts_at"
            error={errorsFor("starts_at")}
          >
            <Input
              id="starts_at"
              type="datetime-local"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </FieldRow>
        )}
      </form.Field>

      <form.Field name="ends_at">
        {(field) => (
          <FieldRow label="Ends" htmlFor="ends_at" error={errorsFor("ends_at")}>
            <Input
              id="ends_at"
              type="datetime-local"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </FieldRow>
        )}
      </form.Field>

      <form.Field name="status">
        {(field) => (
          <FieldRow
            label="Status"
            htmlFor="status"
            className="w-fit"
            error={errorsFor("status")}
          >
            <Select
              value={field.state.value}
              onValueChange={(value) =>
                field.handleChange(value as BookingStatus)
              }
            >
              <SelectTrigger id="status" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_STATUSES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {capitalize(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        )}
      </form.Field>

      <form.Field name="notes">
        {(field) => (
          <FieldRow
            label="Notes"
            htmlFor="notes"
            className="sm:col-span-2 lg:col-span-3"
            error={errorsFor("notes")}
          >
            <Textarea
              id="notes"
              rows={3}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </FieldRow>
        )}
      </form.Field>

      <div className="sm:col-span-2 lg:col-span-3">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create booking"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
