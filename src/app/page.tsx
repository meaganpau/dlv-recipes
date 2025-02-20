import DataTable from '@/components/DataTable';
import { getAllRecipes, getAllIngredients } from '@/lib/db';

export default async function Home() {
  const recipes = await getAllRecipes();
  const ingredients = await getAllIngredients();  
  
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold mb-2">Recipe Database</h1>
        <h2 className="text-sm text-gray-500 mb-8">
          A collection of recipes from Disney Dreamlight Valley
        </h2>
        <DataTable data={recipes} ingredients={ingredients} />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center border-t border-gray-200 pt-4 w-60">
        <span className="text-xs">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://meaganpau.com"
            rel="noopener noreferrer"
            >
            Made by Meagan Pau
          </a>
          </span>
      </footer>
    </div>
  );
}
