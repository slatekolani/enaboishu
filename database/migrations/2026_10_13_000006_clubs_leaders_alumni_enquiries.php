<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clubs', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('kind')->default('Club');            // Club, Sport, Society
            $t->text('summary')->nullable();
            $t->longText('description')->nullable();
            $t->string('patron')->nullable();
            $t->string('meets')->nullable();
            $t->text('achievements')->nullable();
            $t->string('image')->nullable();
            $t->json('photos')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('active')->default(true);
            $t->json('translations')->nullable();
            $t->timestamps();
        });

        Schema::create('student_leaders', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('role');
            $t->string('class_name')->nullable();
            $t->string('term')->nullable();
            $t->text('quote')->nullable();
            $t->string('photo')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->boolean('active')->default(true);
            $t->json('translations')->nullable();
            $t->timestamps();
        });

        Schema::create('alumni', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->unsignedSmallInteger('graduation_year')->nullable();
            $t->string('occupation')->nullable();
            $t->string('organisation')->nullable();
            $t->string('location')->nullable();
            $t->string('email')->nullable();
            $t->string('phone')->nullable();
            $t->text('story')->nullable();
            $t->string('photo')->nullable();
            $t->boolean('mentor')->default(false);
            $t->boolean('show_publicly')->default(false);   // the person's consent to be listed
            $t->boolean('approved')->default(false);         // checked by the school
            $t->boolean('featured')->default(false);
            $t->unsignedInteger('sort')->default(0);
            $t->json('translations')->nullable();
            $t->timestamps();
        });

        Schema::create('enquiries', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->unique();
            $t->string('student_name');
            $t->string('gender')->nullable();
            $t->date('date_of_birth')->nullable();
            $t->string('current_school')->nullable();
            $t->string('class_applying')->nullable();
            $t->string('guardian_name');
            $t->string('relationship')->nullable();
            $t->string('phone');
            $t->string('email')->nullable();
            $t->string('address')->nullable();
            $t->string('heard_from')->nullable();
            $t->text('message')->nullable();
            $t->string('status')->default('New');
            $t->text('notes')->nullable();
            $t->timestamp('status_changed_at')->nullable();
            $t->timestamps();
            $t->index('status');
        });
    }

    public function down(): void
    {
        foreach (['enquiries', 'alumni', 'student_leaders', 'clubs'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
