import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

import {
  type Booking,
  bookingsHref,
  BOOKINGS_PER_PAGE,
  BOOKING_STATUSES,
  listBookings,
  parsePageParam,
  parseStatusParam,
} from "@/lib/bookings";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const MAX_PAGE_LINKS = 5;

export const metadata: Metadata = {
  title: "Bookings",
};

function statusClass(status: Booking["status"]) {
  return {
    pending: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    confirmed:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    cancelled:
      "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  }[status];
}

function formatDateTime(iso: string) {
  const formatter = new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  });

  return formatter.format(new Date(iso));
}

/** Ranges of page numbers around the current page, separated by ellipses. */
function pageRanges(current: number, last: number): (number | null)[] {
  if (last <= MAX_PAGE_LINKS) {
    return Array.from({ length: last }, (_, index) => index + 1);
  }

  const from = Math.max(1, current - 2);
  const to = Math.min(last, current + 2);
  const pages: (number | null)[] = [];

  for (let page = from; page <= to; page++) {
    pages.push(page);
  }

  if (from > 1) {
    if (from > 2) {
      pages.unshift(null);
    }
    pages.unshift(1);
  }
  if (to < last) {
    if (to < last - 1) {
      pages.push(null);
    }
    pages.push(last);
  }

  return pages;
}

async function Bookings({
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

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rego</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Bay</TableHead>
              <TableHead>Starts</TableHead>
              <TableHead>Ends</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono text-[13px]">
                    {booking.rego}
                  </TableCell>
                  <TableCell>{booking.customer_name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {booking.customer_email}
                  </TableCell>
                  <TableCell>{booking.service_bay}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(booking.starts_at)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(booking.ends_at)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        statusClass(booking.status),
                      )}
                    >
                      {booking.status}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-40 truncate">
                    {booking.notes}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No bookings.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground tabular-nums">
        Showing {meta.from ?? 0}–{meta.to ?? 0} of {meta.total} booking
        {meta.total === 1 ? "" : "s"}
      </p>

      {last > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              {current > 1 ? (
                <PaginationPrevious
                  text="Previous"
                  href={bookingsHref({ page: current - 1 })}
                />
              ) : (
                <PaginationPrevious
                  text="Previous"
                  aria-disabled
                  className="pointer-events-none opacity-50"
                />
              )}
            </PaginationItem>
            {pageRanges(current, last).map((page, index) => (
              <PaginationItem key={`${page ?? "ellipsis"}-${index}`}>
                {page === null ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href={bookingsHref({ page })}
                    isActive={page === current}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              {current < last ? (
                <PaginationNext
                  text="Next"
                  href={bookingsHref({ page: current + 1 })}
                />
              ) : (
                <PaginationNext
                  text="Next"
                  aria-disabled
                  className="pointer-events-none opacity-50"
                />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

function TableSkeleton() {
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

export default function BookingsPage({
  searchParams,
}: PageProps<"/bookings">) {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Caravan service bookings, 20 per page.
        </p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <Bookings searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
