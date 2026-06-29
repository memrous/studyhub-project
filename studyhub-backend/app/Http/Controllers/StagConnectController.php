<?php

namespace App\Http\Controllers;

use App\Jobs\StagSyncJob;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StagConnectController extends Controller
{
    public function connect(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'stag_student_id' => 'required|string|max:255',
            'stag_username'   => 'required|string|max:255',
            'stag_password'   => 'required|string',
        ]);

        $user = $request->user();

        $user->update([
            'stag_student_id'  => $validated['stag_student_id'],
            'stag_username'    => $validated['stag_username'],
            'stag_password'    => $validated['stag_password'], // encrypted cast handles this
            'stag_sync_status' => null,
            'stag_sync_error'  => null,
            'stag_synced_at'   => null,
        ]);

        StagSyncJob::dispatch($user);

        return response()->json([
            'user'    => $user->fresh(),
            'message' => 'STAG credentials saved. Sync started in background.',
        ]);
    }

    public function disconnect(Request $request): JsonResponse
    {
        $request->user()->update([
            'stag_student_id'  => null,
            'stag_username'    => null,
            'stag_password'    => null,
            'stag_sync_status' => null,
            'stag_sync_error'  => null,
            'stag_synced_at'   => null,
        ]);

        return response()->json([
            'user'    => $request->user()->fresh(),
            'message' => 'IS/STAG disconnected.',
        ]);
    }

    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'stag_sync_status' => $user->stag_sync_status,
            'stag_synced_at'   => $user->stag_synced_at,
            // stag_sync_error is in $hidden — never returned here, only shown via connect() failure handling
        ]);
    }
}
