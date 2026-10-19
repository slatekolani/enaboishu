<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff_members', function (Blueprint $t) {
            $t->string('academic_department')->nullable()->after('department');
            $t->string('class_assigned')->nullable()->after('subjects');
        });
    }

    public function down(): void
    {
        Schema::table('staff_members', fn (Blueprint $t) => $t->dropColumn(['academic_department', 'class_assigned']));
    }
};
