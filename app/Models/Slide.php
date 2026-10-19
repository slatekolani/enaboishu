<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class Slide extends Model
{
    use Translatable;

    protected $table = 'slides';

    protected $guarded = [];

    protected $casts = ['translations' => 'array'];
}
