import { getAllRecipes, getAllIngredients, getAllCritters } from '@/lib/db';
import { DataTabs } from '@/components/DataTabs';

import '@/styles/Home.scss';

export default function Home() {
  const startTime = performance.now();
  return (
    <div className="min-h-screen p-8 gap-16 sm:pl-20 sm:pr-20 sm:pt-8 sm:pb-8 font-[family-name:var(--font-geist-sans)]">
      <header className='w-full flex flex-col items-center'>
        <span className='text-xs text-gray-500 uppercase tracking-widest text-center'>welcome to</span>
        <h1 className='text-6xl font-bold mb-2 main-title'>DreamDex</h1>
      </header>
      <main>
        <DataTabs 
          recipes={getAllRecipes()}
          ingredients={getAllIngredients()}
          critters={getAllCritters()}
          startTime={startTime}
        />
      </main>
      <footer className="mr-auto ml-auto flex gap-6 flex-wrap items-center justify-center border-t border-gray-200 pt-4 w-60 mt-10">
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
