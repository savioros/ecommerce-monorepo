<?php

namespace App\Modules\Orders\Services;

use App\Models\Order;
use App\Modules\Orders\Repositories\OrderRepository;

class OrderService
{
    public function __construct(
        private readonly OrderRepository $repository,
    ) {}

    public function store(array $data): Order
    {
        return $this->repository->create([
            ...$data,
            'status' => 'PENDENTE',
        ]);
    }
}
