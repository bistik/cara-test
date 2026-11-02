import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  bookingStatusClass,
  formatBookingDateTime,
  getBooking,
  type Booking,
} from "@/lib/bookings";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Booking",
};

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

function statusBadge(status: Booking["status"]) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        bookingStatusClass(status),
      )}
    >
      {status}
    </span>
  );
}

async function BookingDetail({
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
        <Field label="Status">{statusBadge(booking.status)}</Field>
        <Field label="Notes" className="sm:col-span-2 lg:col-span-3">
          {booking.notes ?? "—"}
        </Field>
      </dl>
    </div>
  );
}

function DetailSkeleton() {
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

export default function BookingPage({
  params,
}: PageProps<"/bookings/[bookingId]">) {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <Suspense fallback={<DetailSkeleton />}>
        <BookingDetail params={params} />
      </Suspense>
    </div>
  );
}
