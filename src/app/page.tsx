'use client'

import { useState, useEffect } from 'react';
import RecipesTable from '@/components/RecipesTable';
import { getAllRecipes, getAllIngredients } from '@/lib/db';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Recipe } from '@/types/recipe';
import { Ingredient } from '@/types/ingredient';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [currentTable, setCurrentTable] = useState<'recipes' | 'critters'>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const fetchRecipes = async () => {
    const recipes = await getAllRecipes();   
    setRecipes(recipes);
  };
  const fetchIngredients = async () => {
    const ingredients = await getAllIngredients();
    setIngredients(ingredients);
  };

  useEffect(() => {
    fetchRecipes();
    fetchIngredients();
  }, []);

  const loadingSkeleton = () => {
    return (
      <div className="flex flex-col gap-4 w-full">
        <Skeleton className="w-[400px] h-[30px]" />
        <Skeleton className="w-[400px] h-[30px]" />
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen p-8 gap-16 sm:pl-20 sm:pr-20 sm:pt-8 sm:pb-8 font-[family-name:var(--font-geist-sans)]">
      <header className='w-full flex flex-col items-center'>
        <span className='text-xs text-gray-500 uppercase tracking-widest text-center'>welcome to</span>
        <h1 className='text-6xl font-bold mb-2'>DreamDex</h1>
      </header>
      <main className="flex flex-col row-start-2 items-center w-full">
        <Tabs defaultValue={currentTable} className='w-full'>
          <div className='text-center'>
            <TabsList className='ml-auto mr-auto'>
              <TabsTrigger value="recipes" onClick={() => setCurrentTable('recipes')}>Recipes</TabsTrigger>
              <TabsTrigger value="critters" onClick={() => setCurrentTable('critters')}>Critters</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="recipes" className='mt-8'>
            <h2 className="text-3xl font-bold mb-2">Recipe Database</h2>
            <h3 className="text-sm text-gray-500 mb-8">
              A collection of recipes from Disney Dreamlight Valley
            </h3>
            { recipes.length === 0 ? loadingSkeleton() :
              <RecipesTable data={recipes} ingredients={ingredients} />
            }
          </TabsContent>
          <TabsContent value="critters">
            <h2 className="text-3xl font-bold mb-2">Critter Database</h2>
            <h3 className="text-sm text-gray-500 mb-8">
              A collection of critters from Disney Dreamlight Valley
            </h3>
            Coming soon
            {/* <CrittersTable data={critters} /> */}
          </TabsContent>
        </Tabs>
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
