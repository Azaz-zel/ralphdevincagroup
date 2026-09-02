<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class InboxController extends Controller
{
    public function index(Request $request): View
    {
        $filter = $request->query('status');

        if (! in_array($filter, Inquiry::STATUSES, true)) {
            $filter = null;
        }

        $search = trim((string) $request->query('q', ''));

        $inquiries = Inquiry::status($filter)
            ->search($search)
            ->latest('created_at')
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        // One grouped query rather than four counts.
        $counts = Inquiry::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return view('pages.inbox', [
            'inquiries' => $inquiries,
            'filter' => $filter,
            'search' => $search,
            'counts' => $counts,
            'newCount' => (int) $counts->get('new', 0),
            'total' => (int) $counts->sum(),
        ]);
    }

    public function show(Inquiry $inquiry): View
    {
        // Reading it is what marks it read.
        $inquiry->markAsRead();

        return view('pages.inbox-show', ['inquiry' => $inquiry]);
    }

    public function update(Request $request, Inquiry $inquiry): RedirectResponse
    {
        $validated = $request->validate([
            // 'new' is how a message is put back in the unread pile after
            // being opened by accident.
            'status' => ['required', 'in:new,replied,archived'],
        ]);

        $inquiry->status = $validated['status'];

        if ($validated['status'] === 'replied' && $inquiry->replied_at === null) {
            $inquiry->replied_at = now();
        }

        $inquiry->save();

        return back()->with('status', match ($validated['status']) {
            'replied' => 'Marked as replied.',
            'archived' => 'Archived.',
            default => 'Marked unread.',
        });
    }
}
