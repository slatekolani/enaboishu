<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class Result extends Model
{
    use Translatable;

    protected $table = 'results';

    protected $guarded = [];

    protected $casts = ['translations' => 'array'];
}
