<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class StudentLeader extends Model
{
    use Translatable;

    protected $table = 'student_leaders';

    protected $guarded = [];

    protected $casts = ['photos' => 'array', 'translations' => 'array'];
}
