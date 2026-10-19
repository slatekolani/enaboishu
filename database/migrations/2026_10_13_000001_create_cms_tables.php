<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $t) {
            $t->id();
            $t->string('key')->unique();
            $t->longText('value')->nullable();
            $t->timestamps();
        });

        Schema::create('slides', function (Blueprint $t) {
            $t->id();
            $t->string('eyebrow')->nullable();
            $t->string('title');
            $t->text('subtitle')->nullable();
            $t->string('image')->nullable();
            $t->string('button_label')->nullable();
            $t->string('button_url')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        Schema::create('staff_members', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('position');
            $t->string('department')->default('Teaching');
            $t->string('subjects')->nullable();
            $t->text('bio')->nullable();
            $t->string('photo')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        Schema::create('programs', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->string('level')->default('Ordinary Level');
            $t->text('summary')->nullable();
            $t->text('subjects')->nullable();
            $t->string('image')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        Schema::create('posts', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->string('slug')->unique();
            $t->text('excerpt')->nullable();
            $t->longText('body')->nullable();
            $t->string('image')->nullable();
            $t->date('published_at')->nullable();
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        Schema::create('events', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->date('starts_at');
            $t->date('ends_at')->nullable();
            $t->string('location')->nullable();
            $t->text('description')->nullable();
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        Schema::create('gallery_items', function (Blueprint $t) {
            $t->id();
            $t->string('caption')->nullable();
            $t->string('category')->default('Campus life');
            $t->string('image');
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        Schema::create('testimonials', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('role')->nullable();
            $t->text('quote');
            $t->string('photo')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        Schema::create('stats', function (Blueprint $t) {
            $t->id();
            $t->string('label');
            $t->string('value');
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        Schema::create('facilities', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->text('description')->nullable();
            $t->string('image')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        Schema::create('downloads', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->string('category')->default('Admissions');
            $t->string('file');
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        Schema::create('core_values', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->text('description')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        Schema::create('messages', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('email');
            $t->string('phone')->nullable();
            $t->string('subject')->nullable();
            $t->text('body');
            $t->timestamp('read_at')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['messages', 'core_values', 'downloads', 'facilities', 'stats', 'testimonials', 'gallery_items', 'events', 'posts', 'programs', 'staff_members', 'slides', 'settings'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
