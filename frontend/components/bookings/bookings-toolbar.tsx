import Link from "next/link";

import {
  bookingsHref,
  BOOKING_STATUSES,
  type BookingStatus,
} from "@/lib/bookings";
import { cn } from "@/lib/utils";

/** Status filter pills for the bookings listing. */
export function BookingsToolbar({ status }: { status?: BookingStatus }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={bookingsHref({})}
        className={cn(
          "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm transition-colors",
          !status
            ? "bg-foreground text-background border-transparent dark:bg-zinc-50 dark:text-zinc-900"
            : "hover:bg-muted",
        )}
      >
        All
      </Link>
      {BOOKING_STATUSES.map((option) => (
        <Link
          key={option}
          href={bookingsHref({ status: option })}
          className={cn(
            "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors",
            status === option
              ? "bg-foreground text-background border-transparent dark:bg-zinc-50 dark:text-zinc-900"
              : "hover:bg-muted",
          )}
        >
          {option}
        </Link>
      ))}
    </div>
  );
}
