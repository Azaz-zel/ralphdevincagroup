<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'email', 'division', 'message', 'ip_address', 'user_agent'])]
class Inquiry extends Model
{
    public const STATUSES = ['new', 'read', 'replied', 'archived'];

    public const DIVISIONS = ['perfumery', 'technology', 'unsure'];

    /**
     * Mirrors the column defaults, so a newly created record reads the same
     * in memory as it does once it comes back from the database.
     *
     * `status` is deliberately absent from the fillable list: it is set by the
     * inbox, never by anything a visitor can submit.
     */
    protected $attributes = [
        'division' => 'unsure',
        'status' => 'new',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'replied_at' => 'datetime',
        ];
    }

    /**
     * Opening a message is what marks it read.
     *
     * Only a message that has never been opened is touched, so the timestamp
     * always records the first reading rather than the most recent one.
     */
    public function markAsRead(): void
    {
        if ($this->status !== 'new') {
            return;
        }

        $this->status = 'read';

        // Records the first reading. A message put back in the unread pile and
        // opened again keeps the time it was originally seen.
        $this->read_at ??= now();

        $this->save();
    }

    /**
     * The division as the visitor saw it on the form.
     */
    public function divisionLabel(): string
    {
        return match ($this->division) {
            'perfumery' => 'Perfumery',
            'technology' => 'Technology',
            default => 'Not sure',
        };
    }

    /**
     * Filter the inbox, ignoring anything that is not a real status.
     */
    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        if ($status === null || ! in_array($status, self::STATUSES, true)) {
            return $query;
        }

        return $query->where('status', $status);
    }

    /**
     * Find a message by who sent it or what it says.
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);

        if ($term === '') {
            return $query;
        }

        // Escape the wildcards so a literal % or _ searches for itself.
        $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $term);

        return $query->where(function (Builder $query) use ($escaped) {
            $query->where('name', 'like', "%{$escaped}%")
                ->orWhere('email', 'like', "%{$escaped}%")
                ->orWhere('message', 'like', "%{$escaped}%");
        });
    }
}
