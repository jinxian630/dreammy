<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Illuminate\View\View;

class HelpController extends Controller
{
    public function __invoke(): View
    {
        return view('pages.help.index', [
            'faqs' => Faq::orderBy('sort')->get(),
        ]);
    }
}
