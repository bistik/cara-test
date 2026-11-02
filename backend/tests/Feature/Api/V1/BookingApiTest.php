<?php

namespace Tests\Feature\Api\V1;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_booking_can_be_created(): void
    {
        $response = $this->postJson('/api/v1/bookings', [
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'rego' => 'ABC-123',
            'service_bay' => 'Bay 1',
            'starts_at' => '2026-11-02 08:00:00',
            'ends_at' => '2026-11-02 10:00:00',
            'notes' => 'Wheel alignment',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.customer_name', 'Jane Doe')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas(Booking::class, [
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'rego' => 'ABC-123',
            'service_bay' => 'Bay 1',
            'status' => BookingStatus::Pending->value,
        ]);
    }

    public function test_required_fields_are_validated(): void
    {
        $response = $this->postJson('/api/v1/bookings', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'customer_name',
                'customer_email',
                'rego',
                'service_bay',
                'starts_at',
                'ends_at',
            ]);
    }

    public function test_the_customer_email_must_be_valid(): void
    {
        $response = $this->postJson('/api/v1/bookings', $this->validPayload([
            'customer_email' => 'not-an-email',
        ]));

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('customer_email');
    }

    public function test_ends_at_must_be_after_starts_at(): void
    {
        $response = $this->postJson('/api/v1/bookings', $this->validPayload([
            'starts_at' => '2026-11-02 08:00:00',
            'ends_at' => '2026-11-02 07:00:00',
        ]));

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('ends_at');
    }

    public function test_a_service_bay_with_an_active_booking_cannot_take_a_new_booking(): void
    {
        Booking::factory()->create(['service_bay' => 'Bay 1']);

        $response = $this->postJson('/api/v1/bookings', $this->validPayload([
            'service_bay' => 'Bay 1',
        ]));

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('service_bay');
    }

    public function test_cancelled_bookings_do_not_block_a_service_bay(): void
    {
        Booking::factory()->cancelled()->create(['service_bay' => 'Bay 1']);

        $response = $this->postJson('/api/v1/bookings', $this->validPayload([
            'service_bay' => 'Bay 1',
        ]));

        $response->assertCreated();
    }

    public function test_the_status_is_always_pending_on_create(): void
    {
        $response = $this->postJson('/api/v1/bookings', $this->validPayload([
            'status' => BookingStatus::Confirmed->value,
        ]));

        $response->assertCreated()->assertJsonPath('data.status', 'pending');

        $this->assertSame(BookingStatus::Pending, Booking::query()->firstOrFail()->status);
    }

    public function test_a_booking_can_be_updated(): void
    {
        $booking = Booking::factory()->create(['service_bay' => 'Bay 2']);

        $response = $this->putJson("/api/v1/bookings/{$booking->id}", $this->validPayload([
            'customer_name' => 'John Smith',
            'rego' => 'XYZ-789',
            'service_bay' => 'Bay 4',
        ]));

        $response->assertOk()
            ->assertJsonPath('data.customer_name', 'John Smith')
            ->assertJsonPath('data.rego', 'XYZ-789')
            ->assertJsonPath('data.service_bay', 'Bay 4');

        $this->assertDatabaseHas(Booking::class, [
            'id' => $booking->id,
            'customer_name' => 'John Smith',
            'rego' => 'XYZ-789',
            'service_bay' => 'Bay 4',
            'customer_email' => 'jane@example.com',
        ]);
    }

    public function test_required_fields_are_validated_on_update(): void
    {
        $booking = Booking::factory()->create();

        $response = $this->putJson("/api/v1/bookings/{$booking->id}", []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'customer_name',
                'customer_email',
                'rego',
                'service_bay',
                'starts_at',
                'ends_at',
                'status',
            ]);
    }

    public function test_a_booking_can_keep_its_current_service_bay(): void
    {
        $booking = Booking::factory()->confirmed()->create(['service_bay' => 'Bay 1']);

        $response = $this->putJson("/api/v1/bookings/{$booking->id}", $this->validPayload([
            'service_bay' => 'Bay 1',
        ]));

        $response->assertOk();
    }

    public function test_an_updated_booking_cannot_move_to_a_service_bay_with_an_active_booking(): void
    {
        Booking::factory()->confirmed()->create(['service_bay' => 'Bay 2']);
        $booking = Booking::factory()->confirmed()->create(['service_bay' => 'Bay 1']);

        $response = $this->putJson("/api/v1/bookings/{$booking->id}", $this->validPayload([
            'service_bay' => 'Bay 2',
        ]));

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('service_bay');
    }

    public function test_the_status_can_be_changed_via_update(): void
    {
        $booking = Booking::factory()->confirmed()->create();

        $response = $this->putJson("/api/v1/bookings/{$booking->id}", $this->validPayload([
            'status' => BookingStatus::Cancelled->value,
        ]));

        $response->assertOk()->assertJsonPath('data.status', 'cancelled');

        $this->assertSame(BookingStatus::Cancelled, $booking->refresh()->status);
    }

    public function test_the_status_is_required_on_update(): void
    {
        $booking = Booking::factory()->create();

        $payload = $this->validPayload();
        unset($payload['status']);

        $response = $this->putJson("/api/v1/bookings/{$booking->id}", $payload);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    public function test_an_invalid_status_returns_a_validation_error_on_update(): void
    {
        $booking = Booking::factory()->create();

        $response = $this->putJson("/api/v1/bookings/{$booking->id}", $this->validPayload([
            'status' => 'shipped',
        ]));

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    public function test_a_booking_can_be_deleted(): void
    {
        $booking = Booking::factory()->create();

        $response = $this->deleteJson("/api/v1/bookings/{$booking->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing(Booking::class, ['id' => $booking->id]);
    }

    public function test_a_booking_can_be_fetched(): void
    {
        $booking = Booking::factory()->confirmed()->create(['notes' => 'Wheel alignment']);

        $response = $this->getJson("/api/v1/bookings/{$booking->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $booking->id)
            ->assertJsonPath('data.customer_name', $booking->customer_name)
            ->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('data.notes', 'Wheel alignment');
    }

    public function test_fetching_a_missing_booking_returns_404(): void
    {
        $response = $this->getJson('/api/v1/bookings/999999');

        $response->assertNotFound();

        // The body must be a clean JSON message without debug noise.
        $this->assertSame(['message' => 'Not found.'], $response->json());
    }

    public function test_updating_a_missing_booking_returns_404(): void
    {
        $response = $this->putJson('/api/v1/bookings/999999', $this->validPayload());

        $response->assertNotFound();

        $this->assertSame(['message' => 'Not found.'], $response->json());
    }

    public function test_deleting_a_missing_booking_returns_404(): void
    {
        $response = $this->deleteJson('/api/v1/bookings/999999');

        $response->assertNotFound();

        $this->assertSame(['message' => 'Not found.'], $response->json());
    }

    public function test_bookings_can_be_listed_with_pagination(): void
    {
        Booking::factory(21)->sequence(fn (Sequence $sequence): array => ['service_bay' => 'Bay '.$sequence->index])->create();

        $response = $this->getJson('/api/v1/bookings');

        $response->assertOk()
            ->assertJsonCount(20, 'data')
            ->assertJsonPath('meta.total', 21)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonPath('meta.per_page', 20);
    }

    public function test_a_later_page_returns_the_remaining_bookings(): void
    {
        Booking::factory(21)->sequence(fn (Sequence $sequence): array => ['service_bay' => 'Bay '.$sequence->index])->create();

        $response = $this->getJson('/api/v1/bookings?page=2');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.current_page', 2);
    }

    public function test_bookings_are_ordered_by_starts_at_ascending(): void
    {
        $latest = Booking::factory()->create(['service_bay' => 'Bay 2', 'starts_at' => '2026-11-03 09:00:00']);
        $earliest = Booking::factory()->create(['service_bay' => 'Bay 1', 'starts_at' => '2026-11-01 09:00:00']);

        $response = $this->getJson('/api/v1/bookings');

        $response->assertOk()
            ->assertJsonPath('data.0.id', $earliest->id)
            ->assertJsonPath('data.1.id', $latest->id);
    }

    public function test_bookings_can_be_filtered_by_status(): void
    {
        $confirmed = Booking::factory()->confirmed()->create(['service_bay' => 'Bay 3']);
        Booking::factory()->create(['service_bay' => 'Bay 1']);
        Booking::factory()->cancelled()->create(['service_bay' => 'Bay 2']);

        $response = $this->getJson('/api/v1/bookings?status=confirmed');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $confirmed->id);
    }

    public function test_an_invalid_status_returns_a_validation_error(): void
    {
        $response = $this->getJson('/api/v1/bookings?status=shipped');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    public function test_an_invalid_page_returns_a_validation_error(): void
    {
        $response = $this->getJson('/api/v1/bookings?page=0');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('page');
    }

    public function test_a_page_beyond_the_bookings_returns_an_empty_list(): void
    {
        Booking::factory()->create();

        $response = $this->getJson('/api/v1/bookings?page=99');

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_unknown_query_parameters_are_ignored(): void
    {
        Booking::factory()->create();

        $response = $this->getJson('/api/v1/bookings?foo=baz&status=pending');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    /**
     * A valid booking payload to build upon in individual tests.
     *
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'rego' => 'ABC-123',
            'service_bay' => 'Bay 2',
            'starts_at' => '2026-11-02 08:00:00',
            'ends_at' => '2026-11-02 10:00:00',
            'status' => BookingStatus::Pending->value,
        ], $overrides);
    }
}
