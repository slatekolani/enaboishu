<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

/** A page the school creates in the admin, e.g. "School fees" or "School rules". */
class Page extends Model
{
    use Translatable;

    public const MENU_GROUPS = ['About', 'Academics', 'Admissions', 'News & Events', 'Not in the menu'];

    protected $guarded = [];

    protected $casts = ['photos' => 'array', 'translations' => 'array'];
}
