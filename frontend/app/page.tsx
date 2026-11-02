import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Caravan Service bookings",
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-32">
      <h1 className="text-3xl font-semibold leading-10 tracking-tight">
        Caravan Service bookings
      </h1>
      <Link
        href="/bookings"
        className="text-base font-medium text-primary underline-offset-4 hover:underline"
      >
        Bookings
      </Link>
    </div>
  );
}
