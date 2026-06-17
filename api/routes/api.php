<?php

use App\Modules\Orders\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

Route::post('/orders', [OrderController::class, 'store']);
Route::patch('/orders/{id}/confirm-payment', [OrderController::class, 'confirmPayment']);
