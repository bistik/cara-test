import Link from "next/link";
import type { Metadata } from "next";

import { BookingForm } from "@/components/bookings/booking-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "New booking",
};

export default function NewBookingPage() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
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
              <BreadcrumbPage>New booking</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-semibold tracking-tight">New booking</h1>
        <p className="text-sm text-muted-foreground">
          Create a caravan service booking.
        </p>
      </div>

      <div className="mt-6 rounded-lg border p-4">
        <BookingForm />
      </div>
    </div>
  );
}
