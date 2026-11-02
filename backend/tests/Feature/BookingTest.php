<?php

namespace Tests\Feature;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_service_bay_cannot_have_multiple_pending_bookings(): void
    {
        Booking::factory()->create(['service_bay' => 'Bay 1']);

        $this->expectException(UniqueConstraintViolationException::class);

        Booking::factory()->create(['service_bay' => 'Bay 1']);
    }

    public function test_a_service_bay_cannot_have_pending_and_confirmed_bookings_at_the_same_time(): void
    {
        Booking::factory()->confirmed()->create(['service_bay' => 'Bay 1']);

        $this->expectException(UniqueConstraintViolationException::class);

        Booking::factory()->create(['service_bay' => 'Bay 1']);
    }

    public function test_a_service_bay_cannot_have_multiple_confirmed_bookings(): void
    {
        Booking::factory()->confirmed()->create(['service_bay' => 'Bay 2']);

        $this->expectException(UniqueConstraintViolationException::class);

        Booking::factory()->confirmed()->create(['service_bay' => 'Bay 2']);
    }

    public function test_cancelled_bookings_are_not_constrained_per_service_bay(): void
    {
        Booking::factory()->cancelled()->create(['service_bay' => 'Bay 3']);

        $cancelled = Booking::factory()->cancelled()->create(['service_bay' => 'Bay 3']);

        $this->assertEquals(BookingStatus::Cancelled, $cancelled->status);
    }

    public function test_different_service_bays_can_have_active_bookings_at_the_same_time(): void
    {
        $pending = Booking::factory()->create(['service_bay' => 'Bay 1']);
        $confirmed = Booking::factory()->confirmed()->create(['service_bay' => 'Bay 4']);

        $this->assertEquals(BookingStatus::Pending, $pending->status);
        $this->assertEquals(BookingStatus::Confirmed, $confirmed->status);
    }

    public function test_the_status_is_cast_to_the_booking_status_enum(): void
    {
        $booking = Booking::factory()->confirmed()->create();

        $this->assertInstanceOf(BookingStatus::class, $booking->status);
        $this->assertSame(BookingStatus::Confirmed, $booking->status);
    }
}
