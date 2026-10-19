<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class Alumnus extends Model
{
    use Translatable;

    protected $table = 'alumni';

    protected $guarded = [];

    protected $casts = ['photos' => 'array', 'translations' => 'array', 'mentor' => 'boolean', 'show_publicly' => 'boolean', 'approved' => 'boolean', 'featured' => 'boolean'];
}
