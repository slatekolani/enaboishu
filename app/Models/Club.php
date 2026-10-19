<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    use Translatable;

    protected $table = 'clubs';

    protected $guarded = [];

    protected $casts = ['photos' => 'array', 'translations' => 'array'];
}
