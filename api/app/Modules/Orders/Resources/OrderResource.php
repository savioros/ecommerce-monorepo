<?php

namespace App\Modules\Orders\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'installments' => $this->installments,
            'amount' => $this->amount,
            'customer_name' => $this->customer_name,
            'customer_email' => $this->customer_email,
            'created_at' => $this->created_at,
        ];
    }
}
