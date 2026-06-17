<?php

namespace App\Modules\Orders\Exceptions;

use RuntimeException;

class PaymentNotConfirmedException extends RuntimeException
{
    public function __construct(string $paymentIntentId, string $status)
    {
        parent::__construct(
            "Payment Intent {$paymentIntentId} has status '{$status}', expected 'succeeded'."
        );
    }
}
