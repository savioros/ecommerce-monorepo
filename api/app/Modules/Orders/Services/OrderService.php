<?php

namespace App\Modules\Orders\Services;

use App\Enums\OrderStatus;
use App\Exceptions\StripeIntegrationException;
use App\Models\Order;
use App\Modules\Orders\Exceptions\PaymentNotConfirmedException;
use App\Modules\Orders\Repositories\OrderRepository;
use Illuminate\Support\Facades\DB;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class OrderService
{
    public function __construct(
        private readonly OrderRepository $repository,
        private readonly StripeClient $stripe,
    ) {}

    public function store(array $data): array
    {
        return DB::transaction(function () use ($data): array {
            $order = $this->repository->create([
                ...$data,
                'status' => OrderStatus::Pending,
            ]);

            try {
                $paymentIntent = $this->stripe->paymentIntents->create([
                    'amount' => $order->amount,
                    'currency' => 'brl',
                    'metadata' => ['order_id' => $order->id],
                ]);
            } catch (ApiErrorException $e) {
                throw new StripeIntegrationException($e);
            }

            $order->stripe_payment_intent_id = $paymentIntent->id;
            $order->save();

            return [
                'order' => $order,
                'client_secret' => $paymentIntent->client_secret,
            ];
        });
    }

    public function confirmPayment(int $id): Order
    {
        $order = $this->repository->findById($id);

        $paymentIntent = $this->stripe->paymentIntents->retrieve(
            $order->stripe_payment_intent_id
        );

        if ($paymentIntent->status !== 'succeeded') {
            throw new PaymentNotConfirmedException(
                $paymentIntent->id,
                $paymentIntent->status
            );
        }

        return $this->repository->updateStatus($id, OrderStatus::Approved);
    }
}
