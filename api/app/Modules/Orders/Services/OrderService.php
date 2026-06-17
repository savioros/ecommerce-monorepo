<?php

namespace App\Modules\Orders\Services;

use App\Models\Order;
use App\Modules\Orders\Repositories\OrderRepository;
use Stripe\StripeClient;

class OrderService
{
    public function __construct(
        private readonly OrderRepository $repository,
        private readonly StripeClient $stripe,
    ) {}

    public function store(array $data): array
    {
        $order = $this->repository->create([
            ...$data,
            'status' => 'PENDENTE',
        ]);

        $paymentIntent = $this->stripe->paymentIntents->create([
            'amount' => $order->amount,
            'currency' => 'brl',
            'metadata' => ['order_id' => $order->id],
        ]);

        return [
            'order' => $order,
            'client_secret' => $paymentIntent->client_secret,
        ];
    }
}
