<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use Translatable;

    protected $table = 'articles';

    protected $guarded = [];

    protected $casts = ['photos' => 'array', 'translations' => 'array'];
}
