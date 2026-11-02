<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ListBookingsRequest;
use App\Http\Requests\Api\V1\StoreBookingRequest;
use App\Http\Requests\Api\V1\UpdateBookingRequest;
use App\Http\Resources\Api\V1\BookingResource;
use App\Models\Booking;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    /**
     * List bookings, paginated at 20 per page and ordered by start time.
     * Supports an optional status filter.
     */
    public function index(ListBookingsRequest $request): AnonymousResourceCollection
    {
        $bookings = Booking::query()
            ->when(
                $request->validated('status'),
                fn (Builder $query, string $status): Builder => $query->where('status', BookingStatus::from($status)),
            )
            ->orderBy('starts_at')
            ->paginate(20)
            ->withQueryString();

        return BookingResource::collection($bookings);
    }

    /**
     * Create a new booking.
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        try {
            $booking = Booking::create($request->validated());
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages([
                'service_bay' => 'The service bay already has an active booking.',
            ]);
        }

        $booking->refresh();

        return BookingResource::make($booking)->response()->setStatusCode(201);
    }

    /**
     * Get the given booking.
     */
    public function show(Booking $booking): BookingResource
    {
        return BookingResource::make($booking);
    }

    /**
     * Update the given booking in full. The store validation is shared
     * because a PUT replaces the booking with the complete payload, and
     * the status is additionally accepted on update.
     */
    public function update(UpdateBookingRequest $request, Booking $booking): JsonResponse
    {
        try {
            $booking->update($request->validated());
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages([
                'service_bay' => 'The service bay already has an active booking.',
            ]);
        }

        return BookingResource::make($booking->refresh())->response();
    }

    /**
     * Delete the given booking.
     */
    public function destroy(Booking $booking): JsonResponse
    {
        $booking->delete();

        return response()->json(status: 204);
    }
}
