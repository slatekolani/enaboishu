<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class Download extends Model
{
    use Translatable;

    protected $table = 'downloads';

    protected $guarded = [];

    protected $casts = ['translations' => 'array'];
}
