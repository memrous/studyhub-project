<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'code',
        'name',
        'credits',
        'lecturer',
        'completion_type',
        'is_mandatory',
        'semester',
        'description',
    ];

    protected $casts = [
        'is_mandatory' => 'boolean',
        'credits' => 'integer',
    ];

    protected $appends = [
        'completionType',
        'isMandatory',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function materials()
    {
        return $this->hasMany(Material::class, 'subject_id');
    }

    public function getCompletionTypeAttribute()
    {
        return $this->attributes['completion_type'] ?? null;
    }
    
    public function getIsMandatoryAttribute()
    {
        return $this->attributes['is_mandatory'] ?? null;
    }
}
