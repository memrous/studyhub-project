<?php

use App\Http\Controllers\AcademicController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\StagController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Veřejné endpointy
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/check-availability', [AuthController::class, 'checkAvailability']);

// Academic Dropdowns
Route::get('/academic/universities', [AcademicController::class, 'getUniversities']);
Route::get('/academic/universities/{universityId}/faculties', [AcademicController::class, 'getFaculties']);
Route::get('/academic/faculties/{facultyId}/programs', [AcademicController::class, 'getPrograms']);

// Chráněné endpointy (vyžadují v hlavičce: Authorization: Bearer <token>)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Subjects
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::post('/subjects', [SubjectController::class, 'store']);
    Route::delete('/subjects/{subject}', [SubjectController::class, 'destroy']);

    // Events
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{event}', [EventController::class, 'update']);
    Route::patch('/events/{event}/status', [EventController::class, 'updateStatus']);
    Route::delete('/events/{event}', [EventController::class, 'destroy']);

    // Materials (Resources)
    Route::get('/materials', [MaterialController::class, 'index']);
    Route::post('/materials', [MaterialController::class, 'store']);
    Route::delete('/materials/{material}', [MaterialController::class, 'destroy']);

    // STAG Synchronizace
    Route::post('/stag/sync-schedule', [StagController::class, 'syncSchedule']);
});