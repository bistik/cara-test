/** Loading placeholder for the booking detail (`BookingDetail`). Also used
 * as the `/bookings/<id>/edit` page's fallback, which has the same shape. */
export function BookingDetailSkeleton() {
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
