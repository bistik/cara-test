"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { deleteBooking } from "@/actions/bookings";
import { bookingHref, bookingEditHref } from "@/lib/bookings";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EllipsisVertical, Eye, SquarePen, Trash2 } from "lucide-react";

/** Row actions dropdown for a single booking in the bookings table. */
export function BookingRowActions({ bookingId }: { bookingId: number }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for booking #${bookingId}`}
            />
          }
        >
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4}>
          <DropdownMenuItem render={<Link href={bookingHref(bookingId)} />}>
            <Eye />
            View
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={bookingEditHref(bookingId)} />}>
            <SquarePen />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete booking #{bookingId}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the booking. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const result = await deleteBooking(bookingId);

                  if (!result.ok) {
                    toast.error(result.message);
                    return;
                  }

                  toast.success("Booking deleted", {
                    description: `Booking #${bookingId} was removed.`,
                  });
                  // The server action revalidated /bookings, so the table
                  // refreshes itself; just close the dialog.
                  setConfirmOpen(false);
                });
              }}
            >
              {pending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
