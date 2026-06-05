<?php

namespace App\Modules\Orders\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'customer_email'   => ['required', 'email', 'max:255'],
            'customer_name'    => ['required', 'string', 'max:255'],
            'street'           => ['required', 'string', 'max:255'],
            'street_number'    => ['required', 'string', 'max:20'],
            'complement'       => ['nullable', 'string', 'max:255'],
            'city'             => ['required', 'string', 'max:100'],
            'state'            => ['required', 'string', 'size:2'],
            'zip_code'         => ['required', 'string', 'max:9'],
            'payment_method'   => ['required', 'in:credit_card,pix,boleto'],
            'installments'     => ['nullable', 'integer', 'min:1', 'max:12', 'required_if:payment_method,credit_card'],
            'amount'           => ['required', 'integer', 'min:1'],
        ];
    }
}
