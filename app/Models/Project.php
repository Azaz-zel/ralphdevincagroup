<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'slug', 'name', 'division', 'position', 'summary', 'index_summary', 'meta_label',
    'facts', 'situation', 'constraint', 'result', 'decisions',
    'composition_top', 'composition_heart', 'composition_base',
    'images', 'cover', 'seo_title', 'seo_description',
])]
class Project extends Model
{
    public const DIVISIONS = ['perfumery', 'technology'];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'cover' => 'integer',
            'facts' => 'array',
            'decisions' => 'array',
            'images' => 'array',
        ];
    }

    /**
     * Case studies are addressed by slug, in public and in the admin alike.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * The order the site shows them in. Numbers on the site follow it.
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('position')->orderBy('id');
    }

    /**
     * A text field as paragraphs: the admin separates them with a blank line.
     *
     * @return array<int, string>
     */
    public function paragraphs(string $field): array
    {
        $parts = preg_split('/\R\s*\R/u', trim((string) $this->{$field})) ?: [];

        return array_values(array_filter(array_map('trim', $parts), fn (string $part) => $part !== ''));
    }

    /**
     * @return array<int, array{layer: string, value: string}>
     */
    public function composition(): array
    {
        return [
            ['layer' => 'TOP', 'value' => $this->composition_top],
            ['layer' => 'HEART', 'value' => $this->composition_heart],
            ['layer' => 'BASE', 'value' => $this->composition_base],
        ];
    }

    /**
     * @return array{file: string, alt: string, width?: int, height?: int}|null
     */
    public function coverImage(): ?array
    {
        $images = $this->images ?? [];

        return $images[$this->cover] ?? $images[0] ?? null;
    }

    public function accent(): string
    {
        return config('divisions.'.$this->division.'.accent', 'brass');
    }

    public function divisionLabel(): string
    {
        return config('divisions.'.$this->division.'.short_name', ucfirst($this->division));
    }

    public function listSummary(): string
    {
        return $this->index_summary ?: $this->summary;
    }

    public function pageTitle(): string
    {
        return $this->seo_title ?: $this->name.' | '.config('site.name');
    }

    public function pageDescription(): string
    {
        return $this->seo_description ?: $this->summary;
    }
}
