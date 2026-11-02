<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = $this->faker->dateTimeBetween();

        return [
            'customer_name' => $this->faker->name(),
            'customer_email' => $this->faker->safeEmail(),
            'rego' => strtoupper($this->faker->bothify('???-###')),
            'service_bay' => 'Bay '.$this->faker->numberBetween(1, 5),
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->modify('+2 hours'),
            'status' => BookingStatus::Pending,
            'notes' => $this->faker->optional()->sentence(),
        ];
    }

    /**
     * Indicate that the booking is confirmed.
     */
    public function confirmed(): static
    {
        return $this->state(fn (): array => [
            'status' => BookingStatus::Confirmed,
        ]);
    }

    /**
     * Indicate that the booking is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (): array => [
            'status' => BookingStatus::Cancelled,
        ]);
    }
}
