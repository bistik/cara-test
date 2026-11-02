import { bookingStatusClass, type BookingStatus } from "@/lib/bookings";
import { cn } from "@/lib/utils";

/** Badge for a booking's status, shared by the table and the detail page. */
export function StatusBadge({ status }: { status: BookingStatus }) {
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
