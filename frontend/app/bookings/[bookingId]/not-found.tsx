import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-2 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        Booking not found
      </h1>
      <p className="text-sm text-muted-foreground">
        The booking you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/bookings"
        className="text-sm underline-offset-4 hover:underline"
      >
        Back to bookings
      </Link>
    </div>
  );
}
