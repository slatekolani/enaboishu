<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class CoreValue extends Model
{
    use Translatable;

    protected $table = 'core_values';

    protected $guarded = [];

    protected $casts = ['translations' => 'array'];
}
