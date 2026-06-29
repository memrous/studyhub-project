<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        $materials = Material::whereHas('subject', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->get();

        return response()->json($materials);
    }

    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $validated = $request->validate([
            'subjectId' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) use ($userId) {
                    $exists = Subject::where('id', $value)->where('user_id', $userId)->exists();
                    if (!$exists) {
                        $fail('The selected subject is invalid or does not belong to the user.');
                    }
                },
            ],
            'title' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'description' => 'nullable|string',
            'url' => 'nullable|string|max:255',
            'file' => 'nullable|file|max:51200',
            'size' => 'nullable|string|max:255',
        ]);

        $material = new Material();
        $material->subject_id = $validated['subjectId'];
        $material->title = $validated['title'];
        $material->type = $validated['type'];
        $material->description = $validated['description'] ?? null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('materials', 'public');
            $material->url = Storage::disk('public')->url($path);
            $material->size = $this->formatBytes($file->getSize());
            $material->file_name = $file->getClientOriginalName();
        } else {
            $material->url = $validated['url'];
            $material->size = $validated['size'] ?? 'External Link';
            $material->file_name = null;
        }

        $material->save();

        return response()->json($material, 201);
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes < 1024) {
            return $bytes . ' B';
        }
        $units = ['KB', 'MB', 'GB'];
        $size = $bytes / 1024;
        $unitIndex = 0;
        while ($size >= 1024 && $unitIndex < count($units) - 1) {
            $size /= 1024;
            $unitIndex++;
        }
        return round($size, 1) . ' ' . $units[$unitIndex];
    }

    public function destroy(Request $request, $id)
    {
        $userId = $request->user()->id;

        $material = Material::whereHas('subject', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->findOrFail($id);

        $material->delete();

        return response()->json([
            'message' => 'Material deleted successfully.',
            'id' => (int)$id,
        ]);
    }
}
