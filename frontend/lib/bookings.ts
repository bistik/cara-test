import { api } from "./api";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export const BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
];

export const BOOKINGS_PER_PAGE = 20;

export type Booking = {
  id: number;
  customer_name: string;
  customer_email: string;
  rego: string;
  service_bay: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type LaravelPageLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

type LaravelPageMeta = {
  current_page: number;
  from: number | null;
  to: number | null;
  last_page: number;
  path: string;
  per_page: number;
  total: number;
};

export type BookingsPage = {
  data: Booking[];
  links: LaravelPageLinks;
  meta: LaravelPageMeta;
};

/**
 * Parse the `status` search param, falling back to `undefined` (no filter)
 * for missing or invalid values so the API is never hit with a validation error.
 */
export function parseStatusParam(
  value: string | string[] | undefined,
): BookingStatus | undefined {
  const status = typeof value === "string" ? value : undefined;

  if (status && BOOKING_STATUSES.includes(status as BookingStatus)) {
    return status as BookingStatus;
  }

  return undefined;
}

/** Parse the `page` search param, falling back to page 1 for invalid values. */
export function parsePageParam(
  value: string | string[] | undefined,
): number | undefined {
  const page = typeof value === "string" ? Number.parseInt(value, 10) : NaN;

  if (Number.isInteger(page) && page >= 1) {
    return page;
  }

  return undefined;
}

/** Build an href for the bookings page preserving the current query params. */
export function bookingsHref(params: {
  status?: BookingStatus;
  page?: number;
}): string {
  const search = new URLSearchParams();

  if (params.status) {
    search.set("status", params.status);
  }
  if (params.page && params.page > 1) {
    search.set("page", String(params.page));
  }

  const query = search.toString();

  return query ? `/bookings?${query}` : "/bookings";
}

/** List bookings, paginated 20 per page, optionally filtered by status. */
export function listBookings(params: {
  status?: BookingStatus;
  page?: number;
}): Promise<BookingsPage> {
  const search = new URLSearchParams();

  if (params.status) {
    search.set("status", params.status);
  }
  if (params.page && params.page > 1) {
    search.set("page", String(params.page));
  }

  const query = search.toString();
  const path = `/api/v1/bookings${query ? `?${query}` : ""}`;

  return api.get<BookingsPage>(path);
}
