'use client'

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecipesData } from '@/components/RecipesData';
import { CrittersData } from '@/components/CrittersData';
import { Recipe } from '@/types/recipe';
import { Ingredient } from '@/types/ingredient';
import { Critter } from '@/types/critter';

type DataTabsProps = {
  recipes: Promise<Recipe[]>;
  ingredients: Promise<Ingredient[]>;
  critters: Promise<Critter[]>;
  startTime: number;
};

export function DataTabs({ recipes, ingredients, critters, startTime }: DataTabsProps) {
  const [currentTable, setCurrentTable] = useState<'recipes' | 'critters'>('recipes');

  return (
    <Tabs defaultValue={currentTable} className='w-full'>
      <div className='text-center'>
        <TabsList className='ml-auto mr-auto'>
          <TabsTrigger value="recipes" onClick={() => {
            setCurrentTable('recipes')
            trackEvent({ action: 'switch_table', category: 'recipes' })
          }}>Recipes</TabsTrigger>
          <TabsTrigger value="critters" onClick={() => {
            setCurrentTable('critters')
            trackEvent({ action: 'switch_table', category: 'critters' })
          }}>Critters</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="recipes" className='mt-8'>
        <h2 className="text-3xl font-bold mb-2">Recipe Database</h2>
        <h3 className="text-sm text-gray-500 mb-4">
          A collection of recipes from Disney Dreamlight Valley
        </h3>
        <RecipesData recipes={recipes} ingredients={ingredients} startTime={startTime} />
      </TabsContent>
      <TabsContent value="critters" className='mt-8'>
        <h2 className="text-3xl font-bold mb-2">Critter Database</h2>
        <h3 className="text-sm text-gray-500 mb-4">
          A collection of critters from Disney Dreamlight Valley
        </h3>
        <CrittersData critters={critters} startTime={startTime} />
      </TabsContent>
    </Tabs>
  );
} 