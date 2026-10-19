<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class StaffMember extends Model
{
    use Translatable;

    protected $table = 'staff_members';

    protected $guarded = [];

    protected $casts = ['translations' => 'array'];
}
