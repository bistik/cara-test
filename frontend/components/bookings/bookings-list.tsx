import { listBookings } from "@/api/bookings";
import { parsePageParam, parseStatusParam } from "@/lib/bookings";
import { BookingsPagination } from "@/components/bookings/bookings-pagination";
import { BookingsTable } from "@/components/bookings/bookings-table";
import { BookingsToolbar } from "@/components/bookings/bookings-toolbar";

/**
 * Body of the bookings listing: fetches bookings for the current
 * status/page and composes the toolbar, table and pagination.
 */
export async function BookingsList({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { status: rawStatus, page: rawPage } = await searchParams;
  const status = parseStatusParam(rawStatus);
  const page = parsePageParam(rawPage);

  const { data, meta } = await listBookings({ status, page });
  const current = meta.current_page;
  const last = meta.last_page;

  return (
    <div className="flex flex-col gap-4">
      <BookingsToolbar status={status} />
      <BookingsTable bookings={data} />

      <p className="text-sm text-muted-foreground tabular-nums">
        Showing {meta.from ?? 0}–{meta.to ?? 0} of {meta.total} booking
        {meta.total === 1 ? "" : "s"}
      </p>

      {last > 1 && <BookingsPagination current={current} last={last} />}
    </div>
  );
}
