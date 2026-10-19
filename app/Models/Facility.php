<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    use Translatable;

    protected $table = 'facilities';

    protected $guarded = [];

    protected $casts = ['translations' => 'array'];
}
