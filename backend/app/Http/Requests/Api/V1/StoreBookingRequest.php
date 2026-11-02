<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the full booking payload for both creating and (via the
 * HTTP PUT semantics of a full replacement) updating a booking.
 */
class StoreBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'string', 'email', 'max:255'],
            'rego' => ['required', 'string', 'max:32'],
            'service_bay' => ['required', 'string', 'max:255'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'notes' => ['nullable', 'string'],
        ];
    }

    /**
     * Configure the validator instance, adding a rule that the service bay
     * must not already have an active booking. The database enforces this
     * with a partial unique index; this rule provides a field-level
     * validation error before the constraint is ever reached. When updating
     * a booking, the booking being replaced is excluded from the check so it
     * may remain in its current service bay.
     */
    public function withValidator(ValidatorContract $validator): void
    {
        $validator->after(function (ValidatorContract $validator): void {
            $serviceBay = $validator->getData()['service_bay'] ?? null;

            if ($serviceBay === null) {
                return;
            }

            $excludedBookingId = $this->route('booking') instanceof Booking ? $this->route('booking')->id : null;

            $hasActiveBooking = Booking::where('service_bay', $serviceBay)
                ->whereIn('status', [BookingStatus::Pending->value, BookingStatus::Confirmed->value])
                ->when(
                    $excludedBookingId !== null,
                    fn (Builder $query): Builder => $query->whereKeyNot($excludedBookingId),
                )
                ->exists();

            if ($hasActiveBooking) {
                $validator->errors()->add('service_bay', 'The service bay already has an active booking.');
            }
        });
    }
}
