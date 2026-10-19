<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Tables whose text can also be written in Kiswahili. */
    private array $translatable = [
        'slides', 'staff_members', 'programs', 'posts', 'articles', 'events', 'gallery_items',
        'testimonials', 'stats', 'facilities', 'downloads', 'core_values',
    ];

    public function up(): void
    {
        Schema::create('notices', function (Blueprint $t) {
            $t->id();
            $t->string('message', 300);
            $t->string('tone')->default('Information');
            $t->string('link_label')->nullable();
            $t->string('link_url')->nullable();
            $t->date('starts_at')->nullable();
            $t->date('ends_at')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('active')->default(true);
            $t->json('translations')->nullable();
            $t->timestamps();
        });

        Schema::create('results', function (Blueprint $t) {
            $t->id();
            $t->unsignedSmallInteger('year');
            $t->string('exam')->default('CSEE');
            $t->unsignedInteger('candidates')->default(0);
            $t->unsignedInteger('div_1')->default(0);
            $t->unsignedInteger('div_2')->default(0);
            $t->unsignedInteger('div_3')->default(0);
            $t->unsignedInteger('div_4')->default(0);
            $t->unsignedInteger('div_0')->default(0);
            $t->string('gpa')->nullable();
            $t->string('rank_note')->nullable();
            $t->text('notes')->nullable();
            $t->boolean('active')->default(true);
            $t->json('translations')->nullable();
            $t->timestamps();
            $t->unique(['year', 'exam']);
        });

        Schema::table('downloads', function (Blueprint $t) {
            $t->string('form_level')->default('All forms')->after('category');
            $t->text('description')->nullable()->after('form_level');
            $t->unsignedBigInteger('file_size')->nullable()->after('file');
            $t->string('file_type', 10)->nullable()->after('file_size');
            $t->unsignedInteger('downloads_count')->default(0)->after('file_type');
        });

        foreach ($this->translatable as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->json('translations')->nullable());
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notices');
        Schema::dropIfExists('results');
        Schema::table('downloads', fn (Blueprint $t) => $t->dropColumn(['form_level', 'description', 'file_size', 'file_type', 'downloads_count']));
        foreach ($this->translatable as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->dropColumn('translations'));
        }
    }
};
