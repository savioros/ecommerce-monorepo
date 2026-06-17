<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(255)");
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('PENDENTE', 'APROVADO'))");
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE orders DROP CONSTRAINT orders_status_check");
        DB::statement("ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(255)");
    }
};
