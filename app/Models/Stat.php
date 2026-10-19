<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class Stat extends Model
{
    use Translatable;

    protected $table = 'stats';

    protected $guarded = [];

    protected $casts = ['translations' => 'array'];
}
