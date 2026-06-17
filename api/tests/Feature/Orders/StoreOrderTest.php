<?php

namespace Tests\Feature\Orders;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Stripe\PaymentIntent;
use Stripe\Service\PaymentIntentService;
use Stripe\StripeClient;
use Tests\TestCase;

class StoreOrderTest extends TestCase
{
    use RefreshDatabase;

    private array $validPayload = [
        'customer_email' => 'cliente@exemplo.com',
        'customer_name'  => 'João Silva',
        'street'         => 'Rua das Flores',
        'street_number'  => '123',
        'city'           => 'São Paulo',
        'state'          => 'SP',
        'zip_code'       => '01310-100',
        'payment_method' => 'credit_card',
        'installments'   => 1,
        'amount'         => 5000,
    ];

    private function fakeStripe(
        string $intentId = 'pi_test_abc123',
        string $retrieveStatus = 'succeeded',
    ): void {
        $fakeIntent = PaymentIntent::constructFrom([
            'id'            => $intentId,
            'client_secret' => "cs_test_{$intentId}",
            'status'        => $retrieveStatus,
        ]);

        $paymentIntentsMock = Mockery::mock(PaymentIntentService::class);
        $paymentIntentsMock->shouldReceive('create')->andReturn($fakeIntent);
        $paymentIntentsMock->shouldReceive('retrieve')->andReturn($fakeIntent);

        $stripeMock = Mockery::mock(StripeClient::class);
        $stripeMock->shouldReceive('getService')->with('paymentIntents')->andReturn($paymentIntentsMock);

        $this->app->instance(StripeClient::class, $stripeMock);
    }

    public function test_store_creates_order_and_returns_client_secret(): void
    {
        $this->fakeStripe(intentId: 'pi_test_store_123');

        $response = $this->postJson('/api/orders', $this->validPayload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'order' => ['id', 'status', 'amount', 'customer_name', 'customer_email'],
                'client_secret',
            ])
            ->assertJsonPath('order.status', OrderStatus::Pending->value)
            ->assertJsonPath('client_secret', 'cs_test_pi_test_store_123');

        $this->assertDatabaseHas('orders', [
            'customer_email'            => 'cliente@exemplo.com',
            'status'                    => OrderStatus::Pending->value,
            'stripe_payment_intent_id'  => 'pi_test_store_123',
        ]);
    }

    public function test_store_rejects_order_with_invalid_email(): void
    {
        $response = $this->postJson('/api/orders', array_merge($this->validPayload, [
            'customer_email' => 'email-invalido',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['customer_email']);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_confirm_payment_fails_when_payment_intent_not_succeeded(): void
    {
        $this->fakeStripe(intentId: 'pi_test_fail_456', retrieveStatus: 'requires_payment_method');

        $order = Order::create([
            ...$this->validPayload,
            'status'                   => OrderStatus::Pending,
            'stripe_payment_intent_id' => 'pi_test_fail_456',
        ]);

        $response = $this->patchJson("/api/orders/{$order->id}/confirm-payment");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Pagamento não confirmado pelo provedor.');

        $this->assertDatabaseHas('orders', [
            'id'     => $order->id,
            'status' => OrderStatus::Pending->value,
        ]);
    }

    public function test_confirm_payment_updates_status_to_approved_when_stripe_succeeds(): void
    {
        $this->fakeStripe(intentId: 'pi_test_ok_789', retrieveStatus: 'succeeded');

        $order = Order::create([
            ...$this->validPayload,
            'status'                   => OrderStatus::Pending,
            'stripe_payment_intent_id' => 'pi_test_ok_789',
        ]);

        $response = $this->patchJson("/api/orders/{$order->id}/confirm-payment");

        $response->assertStatus(200)
            ->assertJsonPath('status', OrderStatus::Approved->value);

        $this->assertDatabaseHas('orders', [
            'id'     => $order->id,
            'status' => OrderStatus::Approved->value,
        ]);
    }
}
