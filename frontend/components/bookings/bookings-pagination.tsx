import { bookingsHref } from "@/lib/bookings";
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

/** Pagination links for the bookings listing. */
export function BookingsPagination({
  current,
  last,
}: {
  current: number;
  last: number;
}) {
  return (
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
              <PaginationLink href={bookingsHref({ page })} isActive={page === current}>
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
  );
}
