<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'customer_email',
    'customer_name',
    'street',
    'street_number',
    'complement',
    'city',
    'state',
    'zip_code',
    'payment_method',
    'installments',
    'amount',
    'status',
    'stripe_payment_intent_id',
])]
class Order extends Model
{
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'installments' => 'integer',
        ];
    }
}
