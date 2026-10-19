<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Extra pages the school creates itself (fees, uniform, school rules, …). */
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->string('slug')->unique();
            $t->string('menu_group')->default('About');   // which menu it appears under, or "Not in the menu"
            $t->text('intro')->nullable();
            $t->string('image')->nullable();               // banner photo
            $t->longText('body')->nullable();
            $t->json('photos')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('active')->default(true);
            $t->json('translations')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
