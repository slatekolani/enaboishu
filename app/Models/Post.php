<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use Translatable;

    protected $table = 'posts';

    protected $guarded = [];

    protected $casts = ['photos' => 'array', 'translations' => 'array'];
}
