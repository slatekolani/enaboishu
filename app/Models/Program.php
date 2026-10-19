<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use Translatable;

    protected $table = 'programs';

    protected $guarded = [];

    protected $casts = ['translations' => 'array'];
}
