<?php

use App\Modules\Orders\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

Route::post('/orders', [OrderController::class, 'store']);
