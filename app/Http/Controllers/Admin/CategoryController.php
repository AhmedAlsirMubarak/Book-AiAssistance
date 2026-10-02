<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * List categories for management.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Categories/Index', [
            'categories' => Category::query()->withCount('books')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a new category.
     */
    public function store(Request $request): RedirectResponse
    {
        $category = Category::create($request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('categories', 'name')],
        ]));

        return back()->with('success', "Category “{$category->name}” was created.");
    }

    /**
     * Rename a category.
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        $category->update($request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('categories', 'name')->ignore($category)],
        ]));

        return back()->with('success', "Category renamed to “{$category->name}”.");
    }

    /**
     * Delete a category, as long as no books still belong to it.
     */
    public function destroy(Category $category): RedirectResponse
    {
        // Books cascade-delete with their category, so refuse rather than silently removing them.
        if ($category->books()->exists()) {
            return back()->withErrors([
                'category' => "“{$category->name}” still has books. Move or delete them first.",
            ]);
        }

        $category->delete();

        return back()->with('success', "Category “{$category->name}” was deleted.");
    }
}
