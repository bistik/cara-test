import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { BookingsList } from "@/components/bookings/bookings-list";
import { BookingsSkeleton } from "@/components/bookings/bookings-skeleton";

export const metadata: Metadata = {
  title: "Bookings",
};

export default function BookingsPage({
  searchParams,
}: PageProps<"/bookings">) {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Caravan service bookings, 20 per page.
          </p>
        </div>
        {/* Renders a link, not a native <button>, so Base UI checks out. */}
        <Button size="sm" nativeButton={false} render={<Link href="/bookings/new" />}>
          New booking
        </Button>
      </div>
      <Suspense fallback={<BookingsSkeleton />}>
        <BookingsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
