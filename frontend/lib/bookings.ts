import { ApiError, api } from "./api";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export const BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
];

export const BOOKINGS_PER_PAGE = 20;

/** Tailwind classes for the status badge of a booking. */
export function bookingStatusClass(status: BookingStatus) {
  return {
    pending: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    confirmed:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    cancelled:
      "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  }[status];
}

/** Format an ISO date-time string for display (e.g. `12 Feb 2026, 14:30`). */
export function formatBookingDateTime(iso: string) {
  const formatter = new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  });

  return formatter.format(new Date(iso));
}

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

/** Build an href for the booking detail page of the given booking. */
export function bookingHref(bookingId: number): string {
  return `/bookings/${bookingId}`;
}

/** Build an href for the edit page of the given booking. */
export function bookingEditHref(bookingId: number): string {
  return `/bookings/${bookingId}/edit`;
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

/**
 * Get a single booking. When the API answers with its own 404, the booking
 * does not exist, so `null` is returned and the caller can render not-found.
 * Any other error propagates to the nearest error boundary.
 */
export async function getBooking(bookingId: number): Promise<Booking | null> {
  try {
    // The show endpoint wraps the booking in a `data` key, unlike the
    // paginated index which returns `data` as an array of bookings.
    const { data } = await api.get<{ data: Booking }>(
      `/api/v1/bookings/${bookingId}`,
    );

    return data;
  } catch (error) {
    if (error instanceof ApiError && error.response.status === 404) {
      return null;
    }

    throw error;
  }
}
