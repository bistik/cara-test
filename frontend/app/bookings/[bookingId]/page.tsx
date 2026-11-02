import type { Metadata } from "next";
import { Suspense } from "react";

import { BookingDetail } from "@/components/bookings/booking-detail";
import { BookingDetailSkeleton } from "@/components/bookings/booking-detail-skeleton";

export const metadata: Metadata = {
  title: "Booking",
};

export default async function BookingPage({
  params,
}: PageProps<"/bookings/[bookingId]">) {
  const { bookingId } = await params;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <Suspense fallback={<BookingDetailSkeleton />}>
        <BookingDetail bookingId={bookingId} />
      </Suspense>
    </div>
  );
}
