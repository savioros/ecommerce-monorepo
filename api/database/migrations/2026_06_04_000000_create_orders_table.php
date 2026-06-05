<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('customer_email');
            $table->string('customer_name');
            $table->string('street');
            $table->string('street_number');
            $table->string('complement')->nullable();
            $table->string('city');
            $table->string('state', 2);
            $table->string('zip_code', 9);
            $table->enum('payment_method', ['credit_card', 'pix', 'boleto']);
            $table->unsignedTinyInteger('installments')->nullable();
            $table->unsignedBigInteger('amount');
            $table->string('status')->default('PENDENTE');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
