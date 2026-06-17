<?php

namespace App\Modules\Orders\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Requests\StoreOrderRequest;
use App\Modules\Orders\Services\OrderService;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $service,
    ) {}

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $result = $this->service->store($request->validated());

        return response()->json($result, 201);
    }
}
