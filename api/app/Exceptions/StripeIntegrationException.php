<?php

namespace App\Exceptions;

use RuntimeException;
use Stripe\Exception\ApiErrorException;

class StripeIntegrationException extends RuntimeException
{
    public function __construct(ApiErrorException $previous)
    {
        parent::__construct('Erro no processamento do pagamento.', 0, $previous);
    }
}
