"use client";

import Link from "next/link";

import { bookingHref, bookingEditHref } from "@/lib/bookings";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Eye, SquarePen } from "lucide-react";

/** Row actions dropdown for a single booking in the bookings table. */
export function BookingRowActions({ bookingId }: { bookingId: number }) {
  return (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
