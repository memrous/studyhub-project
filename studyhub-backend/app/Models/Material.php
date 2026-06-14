<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $table = 'resources';

    protected $fillable = [
        'subject_id',
        'title',
        'type',
        'description',
        'url',
        'size',
    ];

    protected $casts = [
        'subject_id' => 'integer',
    ];

    protected $appends = [
        'subjectId',
        'uploadedAt',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function getSubjectIdAttribute()
    {
        return $this->attributes['subject_id'] ?? null;
    }
    
    public function getUploadedAtAttribute()
    {
        return $this->created_at ? $this->created_at->toISOString() : null;
    }
}
