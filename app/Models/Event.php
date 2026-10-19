<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use Translatable;

    protected $table = 'events';

    protected $guarded = [];

    protected $casts = ['photos' => 'array', 'translations' => 'array'];
}
