'use client'

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import RecipesTable from '@/components/RecipesTable';
import CrittersTable from '@/components/CrittersTable';
import { trackEvent } from '@/lib/analytics';

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

export function DataTabs({ recipes, ingredients, critters }) {
  const [currentTable, setCurrentTable] = useState<'recipes' | 'critters'>('recipes');
  
  return (
    <Tabs defaultValue={currentTable} className='w-full'>
    <div className='text-center'>
      <TabsList className='ml-auto mr-auto'>
        <TabsTrigger value="recipes" onClick={() => {
          setCurrentTable('recipes')
          trackEvent({ action: 'click_recipes', category: 'data_tabs' })
        }}>Recipes</TabsTrigger>
        <TabsTrigger value="critters" onClick={() => {
          setCurrentTable('critters')
          trackEvent({ action: 'click_critters', category: 'data_tabs' })
        }}>Critters</TabsTrigger>
      </TabsList>
    </div>
    <TabsContent value="recipes" className='mt-8'>
      <h2 className="text-3xl font-bold mb-2">Recipe Database</h2>
      <h3 className="text-sm text-gray-500 mb-4">
        A collection of recipes from Disney Dreamlight Valley
      </h3>
      { recipes.length === 0 ? loadingSkeleton() :
        <RecipesTable data={recipes} ingredients={ingredients} />
      }
    </TabsContent>
    <TabsContent value="critters" className='mt-8'>
      <h2 className="text-3xl font-bold mb-2">Critter Database</h2>
      <h3 className="text-sm text-gray-500 mb-4">
        A collection of critters from Disney Dreamlight Valley
      </h3>
      { critters.length === 0 ? loadingSkeleton() :
        <CrittersTable data={critters} />
      }
    </TabsContent>
  </Tabs>
  );
} 