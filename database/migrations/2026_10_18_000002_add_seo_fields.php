<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Optional search-engine title and description for every page the school writes itself. */
return new class extends Migration
{
    private const TABLES = ['posts', 'articles', 'events', 'pages'];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->string('seo_title', 120)->nullable();
                $t->string('seo_description', 320)->nullable();
            });
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->dropColumn(['seo_title', 'seo_description']));
        }
    }
};
