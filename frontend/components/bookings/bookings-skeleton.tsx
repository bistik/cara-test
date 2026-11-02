import { BOOKINGS_PER_PAGE } from "@/lib/bookings";

/** Loading placeholder for the bookings listing (`BookingsList`). */
export function BookingsSkeleton() {
  const rows = Array.from({ length: BOOKINGS_PER_PAGE });

  return (
    <div className="flex flex-col gap-4">
      <div className="h-24" />
      <div className="space-y-2 overflow-hidden rounded-lg border">
        {rows.map((_, index) => (
          <div key={index} className="h-12 bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
