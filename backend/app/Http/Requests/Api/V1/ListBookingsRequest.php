<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\BookingStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

/**
 * Validates the query parameters for listing bookings. The status is the
 * only supported filter; extra query parameters are silently ignored.
 */
class ListBookingsRequest extends FormRequest
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
            'status' => ['sometimes', new Enum(BookingStatus::class)],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
