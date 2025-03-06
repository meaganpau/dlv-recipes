'use client'

import { useState, useEffect } from 'react';
import RecipesTable from '@/components/RecipesTable';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Recipe } from '@/types/recipe';
import { Ingredient } from '@/types/ingredient';
import Error from '@/components/Error';

type RecipesDataProps = {
  recipes: Promise<Recipe[]>;
  ingredients: Promise<Ingredient[]>;
  startTime: number;
};

export function RecipesData({ recipes, ingredients, startTime }: RecipesDataProps) {
  const [recipesData, setRecipesData] = useState([]);
  const [ingredientsData, setIngredientsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (recipesData.length > 0 && ingredientsData.length > 0) {
      setIsLoading(false);
    }
  }, [recipesData, ingredientsData]);

  useEffect(() => {
    if (recipes instanceof Promise) {     
      setIsLoading(true);
      recipes.then(setRecipesData);
    } else {
      setRecipesData(recipes);
    }

    if (ingredients instanceof Promise) {
      ingredients.then(setIngredientsData);
    } else {
      setIngredientsData(ingredients);
    }
    
    // @ts-expect-error ReactPromise is not typed
    if (recipes.status === 'rejected' || ingredients.status === 'rejected') {
      // @ts-expect-error ReactPromise is not typed
      setError(recipes.reason || ingredients.reason);
    }
    
  }, [recipes, ingredients]);

  return (
    <div className="space-y-4">
        {error ? (
          <Error error={error} />
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : recipesData.length > 0 && ingredientsData.length > 0 ? (
          <RecipesTable data={recipesData} ingredients={ingredientsData} startTime={startTime} />
        ) : null
      }
    </div>
  );
}