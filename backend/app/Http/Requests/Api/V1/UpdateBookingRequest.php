<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\BookingStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rules\Enum;

/**
 * Validates the full booking payload for updating a booking. Extends the
 * store validation because the HTTP PUT semantics of a full replacement
 * share every store rule, with the status additionally accepted: unlike
 * on create, a booking may be moved between statuses here. The status is
 * required because a PUT replaces the booking with the complete payload.
 */
class UpdateBookingRequest extends StoreBookingRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'status' => ['required', new Enum(BookingStatus::class)],
        ]);
    }
}
