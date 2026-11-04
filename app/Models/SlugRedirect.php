<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** An old web address that now points to a renamed story, article, event or page. */
class SlugRedirect extends Model
{
    protected $guarded = [];

    /** The record an old address belonged to, or null. */
    public static function recordFor(string $resource, string $slug): ?int
    {
        return static::where('resource', $resource)->where('old_slug', $slug)->value('record_id');
    }
}
