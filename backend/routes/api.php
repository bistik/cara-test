<?php

use App\Http\Controllers\Api\V1\BookingController;
use Illuminate\Support\Facades\Route;

Route::get('/v1/bookings', [BookingController::class, 'index'])
    ->name('v1.bookings.index');

Route::post('/v1/bookings', [BookingController::class, 'store'])
    ->name('v1.bookings.store');

Route::get('/v1/bookings/{booking}', [BookingController::class, 'show'])
    ->name('v1.bookings.show');

Route::put('/v1/bookings/{booking}', [BookingController::class, 'update'])
    ->name('v1.bookings.update');

Route::delete('/v1/bookings/{booking}', [BookingController::class, 'destroy'])
    ->name('v1.bookings.destroy');
