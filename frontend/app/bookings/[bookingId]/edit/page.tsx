import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BookingForm } from "@/components/bookings/booking-form";
import type { BookingFormValues } from "@/schemas/booking";
import { getBooking } from "@/lib/bookings";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Edit booking",
};

/**
 * Convert an ISO timestamp into a `datetime-local` input value (local time,
 * `YYYY-MM-DDTHH:mm`, no timezone suffix), as `datetime-local` inputs reject
 * ISO strings.
 */
function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** Map a booking from the API onto the form's pre-filled values. */
function initialValuesFrom(booking: {
  customer_name: string;
  customer_email: string;
  rego: string;
  service_bay: string;
  starts_at: string;
  ends_at: string;
  status: BookingFormValues["status"];
  notes: string | null;
}): BookingFormValues {
  return {
    customer_name: booking.customer_name,
    customer_email: booking.customer_email,
    rego: booking.rego,
    service_bay: booking.service_bay,
    starts_at: toDatetimeLocal(booking.starts_at),
    ends_at: toDatetimeLocal(booking.ends_at),
    status: booking.status,
    notes: booking.notes ?? "",
  };
}

async function EditBooking({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const id = Number.parseInt(bookingId, 10);

  if (!Number.isInteger(id)) {
    notFound();
  }

  // Reuses the REST API's own 404 handling: only a 404 response from
  // `/api/v1/bookings/{id}` means the booking does not exist.
  const booking = await getBooking(id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-muted-foreground"
                render={<Link href="/bookings" />}
              >
                Bookings
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-muted-foreground"
                render={<Link href={`/bookings/${id}`} />}
              >
                {booking.rego}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-semibold tracking-tight">Edit booking</h1>
        <p className="text-sm text-muted-foreground">
          Update this caravan service booking.
        </p>
      </div>

      <div className="mt-6 rounded-lg border p-4">
        <BookingForm bookingId={id} initialValues={initialValuesFrom(booking)} />
      </div>
    </div>
  );
}

function EditSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-5 w-48" />
        <div className="h-7 w-40" />
        <div className="h-5 w-32" />
      </div>
      <div className="h-64 rounded-lg border bg-muted/25" />
    </div>
  );
}

export default function EditBookingPage({
  params,
}: PageProps<"/bookings/[bookingId]/edit">) {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <Suspense fallback={<EditSkeleton />}>
        <EditBooking params={params} />
      </Suspense>
    </div>
  );
}
