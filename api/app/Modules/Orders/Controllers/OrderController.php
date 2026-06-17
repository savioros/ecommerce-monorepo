<?php

namespace App\Modules\Orders\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Requests\StoreOrderRequest;
use App\Modules\Orders\Resources\OrderResource;
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

        return response()->json([
            'order' => new OrderResource($result['order']),
            'client_secret' => $result['client_secret'],
        ], 201);
    }

    public function confirmPayment(int $id): JsonResponse
    {
        $order = $this->service->confirmPayment($id);

        return response()->json(new OrderResource($order));
    }
}
