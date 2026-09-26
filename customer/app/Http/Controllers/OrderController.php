<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\View\View;

class OrderController extends Controller
{
    public function show(Order $order): View
    {
        $this->authorize('view', $order);

        $order->load('events');

        return view('pages.orders.show', [
            'order' => $order,
        ]);
    }

    public function confirmed(Order $order): View
    {
        $this->authorize('view', $order);

        // Only meaningful once the order has been paid.
        abort_if($order->status === OrderStatus::Draft, 404);

        return view('pages.orders.confirmed', [
            'order' => $order,
        ]);
    }
}
