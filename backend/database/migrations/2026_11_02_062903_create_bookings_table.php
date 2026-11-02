<?php

use App\Enums\BookingStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('rego');
            $table->string('service_bay');
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->string('status')->default(BookingStatus::Pending->value);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['service_bay', 'starts_at']);
        });

        // SQLite and PostgreSQL support partial indexes: at most one active booking
        // ({'pending', 'confirmed'}) per service bay. Cancelled bookings are exempt.
        if (in_array(DB::connection()->getDriverName(), ['sqlite', 'pgsql'])) {
            DB::statement(
                'CREATE UNIQUE INDEX bookings_service_bay_active_status_unique '
                .'ON bookings (service_bay) '
                ."WHERE status IN ('pending', 'confirmed')"
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
