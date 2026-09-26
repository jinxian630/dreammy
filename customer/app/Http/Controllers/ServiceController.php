<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\View\View;

class ServiceController extends Controller
{
    public function show(Service $service): View
    {
        abort_unless($service->is_active, 404);

        return view('pages.services.show', [
            'service' => $service,
        ]);
    }
}
