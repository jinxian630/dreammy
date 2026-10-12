<?php

namespace App\Http\Controllers;

use App\Support\Currency;
use Illuminate\Http\RedirectResponse;

class CurrencyController extends Controller
{
    /**
     * Switch the display currency (RM / ¥). Stored in the session and mirrored
     * to the signed-in user's saved preference, then back to the previous page.
     */
    public function switch(string $code): RedirectResponse
    {
        $code = strtoupper($code);

        if (Currency::isSupported($code)) {
            session(['currency' => $code]);

            if ($user = auth()->user()) {
                $user->update(['currency' => $code]);
            }
        }

        return back();
    }
}
