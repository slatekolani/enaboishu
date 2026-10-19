<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->string('slug')->unique();
            $t->string('author')->nullable();
            $t->string('category')->nullable();
            $t->text('excerpt')->nullable();
            $t->longText('body')->nullable();
            $t->string('image')->nullable();
            $t->json('photos')->nullable();
            $t->date('published_at')->nullable();
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        Schema::table('posts', function (Blueprint $t) {
            $t->json('photos')->nullable()->after('image');
        });

        Schema::table('events', function (Blueprint $t) {
            $t->string('slug')->nullable()->unique()->after('title');
            $t->string('time')->nullable()->after('ends_at');
            $t->text('summary')->nullable()->after('location');
            $t->string('image')->nullable()->after('description');
            $t->json('photos')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
        Schema::table('posts', fn (Blueprint $t) => $t->dropColumn('photos'));
        Schema::table('events', function (Blueprint $t) {
            $t->dropUnique(['slug']);
            $t->dropColumn(['slug', 'time', 'summary', 'image', 'photos']);
        });
    }
};
