<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('slides', function (Blueprint $t) {
            $t->string('layout')->default('Arched photo')->after('image');
            $t->string('image_caption')->nullable()->after('layout');
            $t->string('button2_label')->nullable()->after('button_url');
            $t->string('button2_url')->nullable()->after('button2_label');
        });
    }

    public function down(): void
    {
        Schema::table('slides', function (Blueprint $t) {
            $t->dropColumn(['layout', 'image_caption', 'button2_label', 'button2_url']);
        });
    }
};
