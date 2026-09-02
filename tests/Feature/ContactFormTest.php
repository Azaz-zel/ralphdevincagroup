<?php

namespace Tests\Feature;

use App\Mail\InquiryReceived;
use App\Models\Inquiry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use RuntimeException;
use Tests\TestCase;

class ContactFormTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Wayan Sutrisna',
            'email' => 'wayan@example.com',
            'division' => 'technology',
            'message' => 'The bookings for my tour business are still tracked on paper and I keep losing them.',
            'form_rendered_at' => Crypt::encryptString((string) now()->subMinute()->timestamp),
        ], $overrides);
    }

    public function test_a_valid_message_is_stored_and_the_visitor_is_told_it_arrived(): void
    {
        Mail::fake();

        $response = $this->post(route('contact.store'), $this->payload());

        $response->assertRedirect(route('contact').'#form');
        $response->assertSessionHas('status', 'sent');

        $this->assertDatabaseCount('inquiries', 1);

        $inquiry = Inquiry::sole();

        $this->assertSame('Wayan Sutrisna', $inquiry->name);
        $this->assertSame('wayan@example.com', $inquiry->email);
        $this->assertSame('technology', $inquiry->division);
        $this->assertSame('new', $inquiry->status);
        $this->assertNotNull($inquiry->ip_address);
        $this->assertNull($inquiry->read_at);
    }

    public function test_the_notification_goes_to_the_configured_recipient(): void
    {
        Mail::fake();

        $this->post(route('contact.store'), $this->payload());

        Mail::assertSent(InquiryReceived::class, function (InquiryReceived $mail) {
            return $mail->hasTo(config('mail.contact_recipient'));
        });
    }

    /**
     * PRD acceptance criterion 7. The message must survive a mail outage, and
     * the visitor must never be shown an error for something that worked.
     */
    public function test_a_failing_mailer_neither_loses_the_message_nor_alarms_the_visitor(): void
    {
        Mail::shouldReceive('to')->andThrow(new RuntimeException('SMTP is down'));

        $response = $this->post(route('contact.store'), $this->payload());

        $response->assertRedirect(route('contact').'#form');
        $response->assertSessionHas('status', 'sent');
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseCount('inquiries', 1);
    }

    /**
     * PRD acceptance criterion 10.
     */
    public function test_a_filled_honeypot_looks_like_success_and_stores_nothing(): void
    {
        Mail::fake();

        $response = $this->post(route('contact.store'), $this->payload([
            'company_website' => 'https://spam.example.com',
        ]));

        $response->assertRedirect(route('contact').'#form');
        $response->assertSessionHas('status', 'sent');

        $this->assertDatabaseCount('inquiries', 0);
        Mail::assertNothingSent();
    }

    public function test_a_submission_made_within_three_seconds_is_discarded(): void
    {
        Mail::fake();

        $response = $this->post(route('contact.store'), $this->payload([
            'form_rendered_at' => Crypt::encryptString((string) now()->timestamp),
        ]));

        $response->assertSessionHas('status', 'sent');

        $this->assertDatabaseCount('inquiries', 0);
        Mail::assertNothingSent();
    }

    public function test_a_token_this_application_did_not_encrypt_is_discarded(): void
    {
        Mail::fake();

        $this->post(route('contact.store'), $this->payload([
            'form_rendered_at' => 'not-a-real-token',
        ]));

        $this->assertDatabaseCount('inquiries', 0);
    }

    public function test_a_submission_older_than_three_seconds_goes_through(): void
    {
        Mail::fake();

        $this->post(route('contact.store'), $this->payload([
            'form_rendered_at' => Crypt::encryptString((string) now()->subSeconds(4)->timestamp),
        ]));

        $this->assertDatabaseCount('inquiries', 1);
    }

    public function test_the_form_still_works_if_the_timing_field_is_absent(): void
    {
        Mail::fake();

        $payload = $this->payload();
        unset($payload['form_rendered_at']);

        $this->post(route('contact.store'), $payload);

        $this->assertDatabaseCount('inquiries', 1);
    }

    public function test_a_missing_name_is_rejected_with_its_own_message(): void
    {
        $response = $this->post(route('contact.store'), $this->payload(['name' => '']));

        $response->assertSessionHasErrors(['name' => "Add your name so I know who I'm replying to."]);
        $this->assertDatabaseCount('inquiries', 0);
    }

    public function test_an_invalid_email_is_rejected_with_its_own_message(): void
    {
        $response = $this->post(route('contact.store'), $this->payload(['email' => 'not-an-email']));

        $response->assertSessionHasErrors(['email' => "That email address doesn't look right. Check it and try again."]);
        $this->assertDatabaseCount('inquiries', 0);
    }

    public function test_a_message_shorter_than_twenty_characters_is_rejected(): void
    {
        $response = $this->post(route('contact.store'), $this->payload(['message' => 'Too short.']));

        $response->assertSessionHasErrors(['message' => 'Add a little more detail — a sentence or two is enough.']);
        $this->assertDatabaseCount('inquiries', 0);
    }

    public function test_an_unknown_division_is_rejected(): void
    {
        $response = $this->post(route('contact.store'), $this->payload(['division' => 'fragrance-lab']));

        $response->assertSessionHasErrors('division');
        $this->assertDatabaseCount('inquiries', 0);
    }

    public function test_the_contact_page_carries_a_honeypot_and_no_captcha(): void
    {
        $response = $this->get(route('contact'));

        $response->assertOk();
        $response->assertSee('name="company_website"', false);
        $response->assertSee('name="form_rendered_at"', false);
        $response->assertDontSee('recaptcha', false);
        $response->assertDontSee('captcha', false);
    }
}
