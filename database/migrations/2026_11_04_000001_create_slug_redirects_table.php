<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Old web addresses of stories, articles, events and pages, so links shared or listed on Google keep working. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slug_redirects', function (Blueprint $t) {
            $t->id();
            $t->string('resource', 40);          // posts | articles | events | pages
            $t->string('old_slug');
            $t->unsignedBigInteger('record_id');
            $t->timestamps();
            $t->unique(['resource', 'old_slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slug_redirects');
    }
};
