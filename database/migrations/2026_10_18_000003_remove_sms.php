<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** The website no longer sends SMS: notifications are by email only. */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('notification_logs')->where('channel', 'sms')->delete();
        DB::table('settings')->where('key', 'like', 'sms\_%')->delete();

        Schema::table('notification_logs', function (Blueprint $t) {
            $t->dropIndex(['provider_message_id']);
            $t->dropColumn(['provider_status', 'provider_message_id', 'sms_parts']);
        });
        Schema::table('notification_recipients', fn (Blueprint $t) => $t->dropColumn(['phone', 'via_sms', 'via_email']));
    }

    public function down(): void
    {
        Schema::table('notification_recipients', function (Blueprint $t) {
            $t->string('phone')->nullable();
            $t->boolean('via_email')->default(true);
            $t->boolean('via_sms')->default(false);
        });
        Schema::table('notification_logs', function (Blueprint $t) {
            $t->string('provider_status')->nullable();
            $t->string('provider_message_id')->nullable()->index();
            $t->unsignedSmallInteger('sms_parts')->nullable();
        });
    }
};
