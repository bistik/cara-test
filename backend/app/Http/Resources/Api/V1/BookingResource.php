<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_name' => $this->customer_name,
            'customer_email' => $this->customer_email,
            'rego' => $this->rego,
            'service_bay' => $this->service_bay,
            'starts_at' => $this->starts_at->toISOString(),
            'ends_at' => $this->ends_at->toISOString(),
            'status' => $this->status->value,
            'notes' => $this->notes,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
