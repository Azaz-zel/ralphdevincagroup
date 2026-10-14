<?php

namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;
use Illuminate\Validation\Validator;

class ProjectRequest extends FormRequest
{
    public const MAX_IMAGES = 8;

    public function authorize(): bool
    {
        // The route already sits behind auth, and there is one account.
        return $this->user() !== null;
    }

    /**
     * Rows left empty by "Add a row" are dropped rather than rejected.
     */
    protected function prepareForValidation(): void
    {
        $filled = fn (mixed $rows, array $keys) => array_values(array_filter(
            is_array($rows) ? $rows : [],
            fn (mixed $row) => is_array($row) && collect($keys)->contains(fn (string $key) => filled($row[$key] ?? null)),
        ));

        $this->merge([
            'facts' => $filled($this->input('facts'), ['label', 'value']),
            'decisions' => $filled($this->input('decisions'), ['title', 'body']),
            // An existing screenshot whose "Keep" box was unticked sends no
            // file, and leaving it out of the list is what removes it.
            'images' => $filled($this->input('images'), ['file']),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $project = $this->project();

        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'required', 'string', 'max:80', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('projects', 'slug')->ignore($project?->id),
            ],
            'division' => ['required', Rule::in(Project::DIVISIONS)],
            'position' => ['required', 'integer', 'min:1', 'max:999'],
            'summary' => ['required', 'string', 'max:200'],
            'index_summary' => ['nullable', 'string', 'max:240'],
            'meta_label' => ['nullable', 'string', 'max:80'],

            'facts' => ['array', 'max:6'],
            'facts.*.label' => ['required', 'string', 'max:40'],
            'facts.*.value' => ['required', 'string', 'max:120'],

            'situation' => ['required', 'string', 'max:6000'],
            'constraint' => ['nullable', 'string', 'max:6000'],
            'result' => ['required', 'string', 'max:6000'],

            'decisions' => ['required', 'array', 'min:1', 'max:12'],
            'decisions.*.title' => ['required', 'string', 'max:160'],
            'decisions.*.body' => ['required', 'string', 'max:2000'],

            'composition_top' => ['required', 'string', 'max:120'],
            'composition_heart' => ['required', 'string', 'max:120'],
            'composition_base' => ['required', 'string', 'max:120'],

            // Existing screenshots can only be kept, reordered or described,
            // never pointed at a file that belongs to something else.
            'images' => ['array'],
            'images.*.file' => ['required', 'string', Rule::in(array_column($project?->images ?? [], 'file'))],
            'images.*.alt' => ['required', 'string', 'max:300'],

            'uploads' => ['array', 'max:'.self::MAX_IMAGES],
            'uploads.*' => [
                File::image()
                    ->types(['jpeg', 'png', 'webp'])
                    ->max(10 * 1024)
                    ->dimensions(Rule::dimensions()->minWidth(1600)->maxWidth(4000)->maxHeight(4000)),
            ],
            'upload_alts' => ['array'],
            'upload_alts.*' => ['nullable', 'string', 'max:300'],

            'cover' => ['nullable', 'string', 'max:200'],

            'seo_title' => ['nullable', 'string', 'max:120'],
            'seo_description' => ['nullable', 'string', 'max:300'],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $uploads = $this->file('uploads', []);
                $total = count($this->input('images', [])) + count($uploads);

                if ($total === 0) {
                    $validator->errors()->add('uploads', 'Add at least one screenshot. The work list needs a cover.');
                }

                if ($total > self::MAX_IMAGES) {
                    $validator->errors()->add('uploads', 'A case study holds up to '.self::MAX_IMAGES.' screenshots.');
                }

                foreach (array_keys($uploads) as $index) {
                    if (blank($this->input("upload_alts.{$index}"))) {
                        $validator->errors()->add("upload_alts.{$index}", 'Describe what this screenshot shows.');
                    }
                }
            },
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.regex' => 'Use lowercase letters, numbers and single hyphens only.',
            'slug.unique' => 'Another project already uses this address.',
            'decisions.required' => 'Add at least one decision. The home page quotes the first.',
            'decisions.*.title.required' => 'Each decision needs a short title.',
            'decisions.*.body.required' => 'Say why this decision was made.',
            'facts.*.label.required' => 'Each fact needs a label.',
            'facts.*.value.required' => 'Each fact needs a value.',
            'images.*.alt.required' => 'Describe what this screenshot shows.',
            'images.*.file.in' => 'That screenshot does not belong to this project.',
            'uploads.*.dimensions' => 'Screenshots must be 1600 to 4000 pixels wide, and no taller than 4000.',
            'uploads.*.max' => 'Each screenshot must be under 10 MB.',
            'uploads.*.mimes' => 'Use a JPG, PNG or WebP file.',
            'uploads.*.image' => 'Use a JPG, PNG or WebP file.',
        ];
    }

    public function project(): ?Project
    {
        $project = $this->route('project');

        return $project instanceof Project ? $project : null;
    }
}
