<?php

namespace App\Models;

use App\Models\Concerns\Translatable;
use Illuminate\Database\Eloquent\Model;

class GalleryItem extends Model
{
    use Translatable;

    protected $table = 'gallery_items';

    protected $guarded = [];

    protected $casts = ['translations' => 'array'];
}
