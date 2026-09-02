<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('email', 180);
            $table->enum('division', ['perfumery', 'technology', 'unsure'])->default('unsure');
            $table->text('message');
            $table->enum('status', ['new', 'read', 'replied', 'archived'])->default('new');

            // Long enough for IPv6.
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 255)->nullable();

            $table->timestamp('read_at')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->timestamps();

            // How the inbox is ordered, and how repeat messages from one
            // person are found.
            $table->index(['status', 'created_at']);
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};
