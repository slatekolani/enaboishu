<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class Notice extends Model
{
    use Translatable;

    protected $table = 'notices';

    protected $guarded = [];

    protected $casts = ['translations' => 'array'];
}
