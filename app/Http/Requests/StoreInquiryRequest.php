<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:180'],
            'division' => ['required', 'in:perfumery,technology,unsure'],
            'message' => ['required', 'string', 'min:20', 'max:4000'],

            // Filled only by bots. Handled in the controller, never rejected
            // here — a bot should not learn that it was caught.
            'company_website' => ['nullable', 'string'],

            // Encrypted render time, used to reject instant submissions.
            'form_rendered_at' => ['nullable', 'string'],
        ];
    }

    /**
     * Say what is wrong and how to fix it, in the site's own voice.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => "Add your name so I know who I'm replying to.",
            'email.required' => "That email address doesn't look right. Check it and try again.",
            'email.email' => "That email address doesn't look right. Check it and try again.",
            'message.required' => 'Add a little more detail — a sentence or two is enough.',
            'message.min' => 'Add a little more detail — a sentence or two is enough.',
        ];
    }

    /**
     * A failed submission returns to the form, not to the top of the page.
     */
    protected function getRedirectUrl(): string
    {
        return route('contact').'#form';
    }
}
