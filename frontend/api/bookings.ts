import { ApiError, api } from "./client";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

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
