<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    use Translatable;

    protected $table = 'testimonials';

    protected $guarded = [];

    protected $casts = ['translations' => 'array'];
}
