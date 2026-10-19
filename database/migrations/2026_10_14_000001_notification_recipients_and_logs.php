<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_recipients', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('title')->nullable();          // e.g. Head of School, Secretary
            $t->string('email')->nullable();
            $t->string('phone')->nullable();
            $t->boolean('via_email')->default(true);
            $t->boolean('via_sms')->default(false);
            $t->boolean('on_enquiries')->default(true);
            $t->boolean('on_messages')->default(true);
            $t->boolean('on_alumni')->default(true);
            $t->boolean('active')->default(true);
            $t->unsignedInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('notification_logs', function (Blueprint $t) {
            $t->id();
            $t->string('channel');                     // sms | email
            $t->string('audience');                    // sender | staff | test
            $t->string('event');                       // enquiry | message | alumni | test
            $t->string('reference')->nullable();       // e.g. ENQ-2026-0001
            $t->string('to');
            $t->string('subject')->nullable();
            $t->text('body')->nullable();
            $t->string('status');                      // sent | test | delivered | failed | skipped | …
            $t->string('provider_status')->nullable();
            $t->string('provider_message_id')->nullable()->index();
            $t->unsignedSmallInteger('sms_parts')->nullable();
            $t->text('error')->nullable();
            $t->timestamps();
            $t->index(['channel', 'status']);
        });

        // Carry over the old single "send email alerts to" setting as recipients.
        $old = DB::table('settings')->where('key', 'notify_email')->value('value');
        foreach (array_filter(array_map('trim', explode(',', (string) $old))) as $email) {
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                DB::table('notification_recipients')->insert([
                    'name' => 'School office', 'title' => 'Office', 'email' => $email,
                    'via_email' => true, 'via_sms' => false, 'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }
        DB::table('settings')->where('key', 'notify_email')->delete();
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('notification_recipients');
    }
};
