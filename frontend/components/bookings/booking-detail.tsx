import Link from "next/link";
import { notFound } from "next/navigation";

import { getBooking } from "@/api/bookings";
import { formatBookingDateTime } from "@/lib/bookings";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/bookings/status-badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/** A labelled field in the booking details definition list. */
function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/** Booking detail: breadcrumbs, heading and the field list. */
export async function BookingDetail({ bookingId }: { bookingId: string }) {
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
              <BreadcrumbPage>{booking.rego}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-semibold tracking-tight">Booking</h1>
        <p className="text-sm text-muted-foreground">Booking details.</p>
      </div>

      <dl className="grid gap-x-6 gap-y-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Rego">
          <span className="font-mono text-[13px]">{booking.rego}</span>
        </Field>
        <Field label="Customer">{booking.customer_name}</Field>
        <Field label="Email">
          <span className="text-muted-foreground">{booking.customer_email}</span>
        </Field>
        <Field label="Service bay">{booking.service_bay}</Field>
        <Field label="Starts">
          {formatBookingDateTime(booking.starts_at)}
        </Field>
        <Field label="Ends">
          {formatBookingDateTime(booking.ends_at)}
        </Field>
        <Field label="Status">
          <StatusBadge status={booking.status} />
        </Field>
        <Field label="Notes" className="sm:col-span-2 lg:col-span-3">
          {booking.notes ?? "—"}
        </Field>
      </dl>
    </div>
  );
}
