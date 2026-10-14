<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 80)->unique();
            $table->string('name', 120);
            $table->enum('division', ['perfumery', 'technology']);
            $table->unsignedInteger('position')->default(1);

            $table->string('summary', 200);
            $table->string('index_summary', 240)->nullable();
            $table->string('meta_label', 80)->nullable();

            // The case study itself. Paragraphs are separated by a blank line.
            $table->json('facts');
            $table->text('situation');
            $table->text('constraint')->nullable();
            $table->text('result');
            $table->json('decisions');

            $table->string('composition_top', 120);
            $table->string('composition_heart', 120);
            $table->string('composition_base', 120);

            // [{file, alt, width, height, uploaded?}] in display order.
            $table->json('images');
            $table->unsignedTinyInteger('cover')->default(0);

            $table->string('seo_title', 120)->nullable();
            $table->string('seo_description', 300)->nullable();

            $table->timestamps();

            $table->index('position');
        });

        // The three case studies that existed before the admin did, so a fresh
        // deploy shows the same site it showed before this migration.
        foreach (require database_path('data/projects.php') as $index => $project) {
            DB::table('projects')->insert([
                'slug' => $project['slug'],
                'name' => $project['name'],
                'division' => $project['division'],
                'position' => $index + 1,
                'summary' => $project['summary'],
                'index_summary' => $project['index_summary'],
                'meta_label' => $project['meta_label'],
                'facts' => json_encode($project['meta']),
                'situation' => implode("\n\n", $project['situation']),
                'constraint' => implode("\n\n", $project['constraint']),
                'result' => implode("\n\n", $project['result']),
                'decisions' => json_encode($project['decisions']),
                'composition_top' => $project['composition'][0]['value'],
                'composition_heart' => $project['composition'][1]['value'],
                'composition_base' => $project['composition'][2]['value'],
                'images' => json_encode(array_map(function (array $image) {
                    [$width, $height] = config('images.'.$image['file'], [1600, 800]);

                    return ['file' => $image['file'], 'alt' => $image['alt'], 'width' => $width, 'height' => $height];
                }, $project['images'])),
                'cover' => 0,
                'seo_description' => $project['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
