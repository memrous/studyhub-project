<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'title',
        'date',
        'time',
        'end_time',
        'type',
        'status',
    ];

    protected $casts = [
        'subject_id' => 'integer',
    ];

    protected $appends = [
        'subjectId',
        'startTime',
        'endTime',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function getSubjectIdAttribute()
    {
        return $this->subject_id;
    }

    public function getStartTimeAttribute()
    {
        return $this->time;
    }

    public function getEndTimeAttribute()
    {
        return $this->end_time;
    }
}
