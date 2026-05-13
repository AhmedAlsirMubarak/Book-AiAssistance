<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Book;
use app\Models\category;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some sample categories
        $programing= category::create(['name' => 'programing']);
        $horror = category::create(['name' => 'horror']);
        $fiction = category::create(['name' => 'fiction']);
        $fantasy = category::create(['name' => 'fantasy']);

        //create some sample books
        
        Book::create([
            'title' => 'The Great Gatsby',
            'author' => 'F. Scott Fitzgerald',
            'description' => 'A novel about the American dream and the decadence of the Jazz Age.',
            'category_id' => $fiction->id,
        ]);

        Book::create([
            'title' => 'The Shining',
            'author' => 'Stephen King',
            'description' => 'A horror novel about a family staying in an isolated hotel with a dark past.',
            'category_id' => $horror->id,
        ]);

            Book::create([
                'title' => 'Harry Potter and the Sorcerer\'s Stone',
                'author' => 'J.K. Rowling',
                'description' => 'The first book in the Harry Potter series, introducing the magical world of Hogwarts.',
                'category_id' => $fantasy->id,
            ]);

    }
}
