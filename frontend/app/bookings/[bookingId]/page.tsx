import type { Metadata } from "next";
import { Suspense } from "react";

import { BookingDetail } from "@/components/bookings/booking-detail";
import { BookingDetailSkeleton } from "@/components/bookings/booking-detail-skeleton";

export const metadata: Metadata = {
  title: "Booking",
};

/** Awaits the route params inside the `<Suspense>` boundary so the page
 * prerenders its shell instead of blocking on runtime data. */
async function BookingDetailSection({
  params,
}: {
  params: PageProps<"/bookings/[bookingId]">["params"];
}) {
  const { bookingId } = await params;
  return <BookingDetail bookingId={bookingId} />;
}

export default function BookingPage({
  params,
}: PageProps<"/bookings/[bookingId]">) {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <Suspense fallback={<BookingDetailSkeleton />}>
        <BookingDetailSection params={params} />
      </Suspense>
    </div>
  );
}
