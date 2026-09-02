<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInquiryRequest;
use App\Mail\InquiryReceived;
use App\Models\Inquiry;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ContactController extends Controller
{
    /**
     * A form submitted faster than a person could plausibly type is a bot.
     */
    private const MINIMUM_SECONDS_ON_PAGE = 3;

    public function store(StoreInquiryRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $redirect = redirect()->to(route('contact').'#form');

        // Bots get the same answer a person gets. Nothing is stored, nothing
        // is sent, and nothing in the response reveals that they were caught.
        if (filled($validated['company_website'] ?? null) || $this->submittedTooFast($validated['form_rendered_at'] ?? null)) {
            return $redirect->with('status', 'sent');
        }

        // Saved first, deliberately. If the mail step fails after this point
        // the message is still safe in the inbox; if the order were reversed,
        // an SMTP outage would lose it for good.
        $inquiry = Inquiry::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'division' => $validated['division'],
            'message' => $validated['message'],
            'ip_address' => $request->ip(),
            'user_agent' => substr($request->userAgent() ?? '', 0, 255) ?: null,
        ]);

        try {
            Mail::to(config('mail.contact_recipient'))->send(new InquiryReceived($inquiry));
        } catch (Throwable $e) {
            // The visitor did nothing wrong and their message is not lost, so
            // they are told it arrived. Only the owner's notification failed.
            report($e);
        }

        return $redirect->with('status', 'sent');
    }

    /**
     * The form carries an encrypted render time. Anything submitted within a
     * few seconds of the page rendering, or carrying a value this application
     * did not encrypt, is treated as automated.
     */
    private function submittedTooFast(?string $token): bool
    {
        // Absent entirely: let it through rather than block a real visitor.
        if ($token === null || $token === '') {
            return false;
        }

        try {
            $renderedAt = (int) Crypt::decryptString($token);
        } catch (DecryptException) {
            return true;
        }

        return (now()->timestamp - $renderedAt) < self::MINIMUM_SECONDS_ON_PAGE;
    }
}
