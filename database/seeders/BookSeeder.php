<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Book;
use App\Models\Category;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some sample categories
        
       $programming = Category::create(['name' => 'programming']);
        $horror = Category::create(['name' => 'horror']);
        $fiction = Category::create(['name' => 'fiction']);
        $fantasy = Category::create(['name' => 'fantasy']);

        //create some sample books
        
        Book::create([
            'title' => 'The Great Gatsby',
            'author' => 'F. Scott Fitzgerald',
            'price' => 100,
            'category_id' => $fiction->id,
        ]);

        Book::create([
            'title' => 'The Shining',
            'author' => 'Stephen King',
            'price' => 1200,
            'category_id' => $horror->id,
        ]);

            Book::create([
                'title' => 'Harry Potter and the Sorcerer\'s Stone',
                'author' => 'J.K. Rowling',
                'price' => 500,
                'category_id' => $fantasy->id,
            ]);

    }
}
