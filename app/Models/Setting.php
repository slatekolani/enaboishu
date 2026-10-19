<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'settings';

    protected $guarded = [];

    protected static function booted(): void
    {
        // Keep the in-memory copy of the settings in step with the database.
        static::saved(fn () => \App\Support\Site::forget());
        static::deleted(fn () => \App\Support\Site::forget());
    }
}
