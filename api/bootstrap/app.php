<?php

use App\Exceptions\StripeIntegrationException;
use App\Modules\Orders\Exceptions\PaymentNotConfirmedException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->renderable(function (StripeIntegrationException $e) {
            return response()->json(
                ['message' => 'Erro no processamento do pagamento.'],
                502
            );
        });

        $exceptions->renderable(function (PaymentNotConfirmedException $e) {
            return response()->json(
                ['message' => 'Pagamento não confirmado pelo provedor.'],
                422
            );
        });
    })->create();
