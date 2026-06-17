<?php

namespace App\Modules\Orders\Repositories;

use App\Enums\OrderStatus;
use App\Models\Order;

class OrderRepository
{
    public function create(array $data): Order
    {
        return Order::create($data);
    }

    public function findById(int $id): Order
    {
        return Order::findOrFail($id);
    }

    public function updateStatus(int $id, OrderStatus $status): Order
    {
        $order = Order::findOrFail($id);
        $order->status = $status;
        $order->save();
        return $order;
    }
}
