<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $catalog = [
            'programming' => [
                ['Laravel: Up & Running', 'Matt Stauffer', 39.99, 'A practical, hands-on guide to building modern PHP applications with the Laravel framework.'],
                ['Clean Code', 'Robert C. Martin', 34.50, 'A handbook of agile software craftsmanship: how to write code that is readable, maintainable and elegant.'],
                ['The Pragmatic Programmer', 'David Thomas & Andrew Hunt', 42.00, 'Timeless advice on becoming a better developer, from personal responsibility to career growth.'],
                ['Eloquent JavaScript', 'Marijn Haverbeke', 29.95, 'A modern introduction to programming with JavaScript, covering the language and the browser.'],
                ['Designing Data-Intensive Applications', 'Martin Kleppmann', 49.99, 'The big ideas behind reliable, scalable and maintainable data systems.'],
                ['Refactoring', 'Martin Fowler', 44.99, 'Improving the design of existing code through small, safe, behavior-preserving transformations.'],
            ],
            'fiction' => [
                ['The Great Gatsby', 'F. Scott Fitzgerald', 10.99, 'Jay Gatsby\'s lavish parties and longing for Daisy Buchanan in the Jazz Age of 1920s New York.'],
                ['To Kill a Mockingbird', 'Harper Lee', 12.99, 'A young girl witnesses her father defend a Black man accused of a terrible crime in the American South.'],
                ['1984', 'George Orwell', 9.99, 'A chilling vision of a totalitarian future of surveillance, propaganda and Big Brother.'],
                ['Pride and Prejudice', 'Jane Austen', 8.50, 'Elizabeth Bennet and Mr. Darcy navigate manners, marriage and misjudgment in Regency England.'],
                ['The Midnight Library', 'Matt Haig', 16.99, 'Between life and death lies a library where every book is a life you could have lived.'],
            ],
            'fantasy' => [
                ['Harry Potter and the Sorcerer\'s Stone', 'J.K. Rowling', 14.99, 'An orphan boy discovers he is a wizard and begins his first year at Hogwarts.'],
                ['The Hobbit', 'J.R.R. Tolkien', 13.99, 'Bilbo Baggins is swept into a quest to reclaim a dwarf kingdom from the dragon Smaug.'],
                ['The Name of the Wind', 'Patrick Rothfuss', 18.99, 'The legendary Kvothe tells the story of his life, from orphan to the most notorious wizard of his age.'],
                ['Mistborn: The Final Empire', 'Brandon Sanderson', 17.50, 'A crew of thieves plans a heist against an immortal emperor in a world of ash and mist.'],
                ['A Game of Thrones', 'George R.R. Martin', 19.99, 'Noble houses scheme and battle for the Iron Throne while an ancient threat awakens in the north.'],
            ],
            'horror' => [
                ['The Shining', 'Stephen King', 15.99, 'A family becomes the winter caretakers of an isolated hotel with a violent past.'],
                ['It', 'Stephen King', 18.99, 'A group of friends face a shape-shifting evil that preys on the children of Derry, Maine.'],
                ['Dracula', 'Bram Stoker', 7.99, 'The classic epistolary tale of Count Dracula\'s journey from Transylvania to England.'],
                ['Mexican Gothic', 'Silvia Moreno-Garcia', 16.50, 'A glamorous socialite investigates her cousin\'s strange letters from a decaying mansion.'],
            ],
            'science fiction' => [
                ['Dune', 'Frank Herbert', 18.00, 'Paul Atreides is thrust into a war for the desert planet Arrakis and its precious spice.'],
                ['Project Hail Mary', 'Andy Weir', 19.50, 'A lone astronaut wakes up with no memory and the fate of humanity in his hands.'],
                ['The Left Hand of Darkness', 'Ursula K. Le Guin', 14.00, 'An envoy to a planet whose people have no fixed gender confronts politics and friendship.'],
                ['Neuromancer', 'William Gibson', 13.50, 'The cyberpunk classic about a washed-up hacker hired for one last impossible job.'],
            ],
            'self-help' => [
                ['Atomic Habits', 'James Clear', 21.99, 'Tiny changes, remarkable results: a proven framework for building good habits and breaking bad ones.'],
                ['Deep Work', 'Cal Newport', 18.50, 'Rules for focused success in a distracted world.'],
                ['Thinking, Fast and Slow', 'Daniel Kahneman', 20.00, 'The two systems that drive the way we think, and how they shape our judgments and decisions.'],
            ],
            'history' => [
                ['Sapiens', 'Yuval Noah Harari', 22.99, 'A brief history of humankind, from the Stone Age to the twenty-first century.'],
                ['Guns, Germs, and Steel', 'Jared Diamond', 19.99, 'Why some societies came to dominate others: geography, agriculture and disease.'],
            ],
        ];

        foreach ($catalog as $categoryName => $books) {
            $category = Category::firstOrCreate(['name' => $categoryName]);

            foreach ($books as [$title, $author, $price, $description]) {
                Book::updateOrCreate(
                    ['title' => $title, 'author' => $author],
                    ['price' => $price, 'description' => $description, 'category_id' => $category->id],
                );
            }
        }
    }
}
