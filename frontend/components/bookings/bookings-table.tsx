import type { Booking } from "@/api/bookings";
import { formatBookingDateTime } from "@/lib/bookings";
import { BookingRowActions } from "@/components/bookings/booking-row-actions";
import { StatusBadge } from "@/components/bookings/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MAX_NOTES_LENGTH = 20;

/** Truncate notes to a fixed character count with an ellipsis. */
function truncateNotes(notes: string | null) {
  if (!notes || notes.length <= MAX_NOTES_LENGTH) {
    return notes;
  }

  return `${notes.slice(0, MAX_NOTES_LENGTH)}…`;
}

/** The bookings listing table, with sticky row actions per booking. */
export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  return (
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
            <TableHead className="sticky right-0 z-10 w-10 border-l bg-card">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length ? (
            bookings.map((booking) => (
              <TableRow key={booking.id} className="group/row">
                <TableCell className="font-mono text-[13px]">
                  {booking.rego}
                </TableCell>
                <TableCell>{booking.customer_name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {booking.customer_email}
                </TableCell>
                <TableCell>{booking.service_bay}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatBookingDateTime(booking.starts_at)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatBookingDateTime(booking.ends_at)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={booking.status} />
                </TableCell>
                <TableCell className="max-w-40">
                  {truncateNotes(booking.notes)}
                </TableCell>
                <TableCell className="sticky right-0 z-10 border-l bg-card transition-colors group-hover/row:bg-muted/50">
                  <BookingRowActions bookingId={booking.id} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No bookings.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
