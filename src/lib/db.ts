'use server'

import { Ingredient } from '@/types/ingredient';
import { Recipe } from '@/types/recipe';
import { Critter } from '@/types/critter';
import { sql } from '@vercel/postgres';

export async function getAllRecipes() {
  try {
    const { rows } = await sql<Recipe>`
      SELECT 
        r.id,
        r.image_url,
        r.name,
        json_build_object(
          'name', rt.name,
          'image_url', rt.image_url
        ) as type,
        r.stars,
        r.energy,
        r.sell_price,
        c.name as collection,
        (
          SELECT json_agg(
            CASE 
              WHEN jsonb_typeof(element) = 'array' THEN (
                SELECT json_agg(
                  json_build_object(
                    'name', i.name,
                    'image_url', i.image_url
                  )
                )
                FROM ingredients i
                WHERE i.id = ANY(SELECT jsonb_array_elements(element)::text::integer)
              )
              ELSE (
                SELECT json_build_object(
                  'name', i.name,
                  'image_url', i.image_url
                )
                FROM ingredients i
                WHERE i.id = element::text::integer
              )
            END
          )
          FROM jsonb_array_elements(r.ingredient_ids) element
        ) as ingredients
      FROM recipes r
      JOIN recipe_types rt ON r.type_id = rt.id
      JOIN collections c ON r.collection_id = c.id;
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch recipe data.');
  }
}

export async function getAllIngredients() {
  const { rows } = await sql<Ingredient>`
    SELECT 
      i.id,
      i.name,
      i.image_url,
      it.name as ingredient_type,
      i.is_generic
    FROM ingredients i
    JOIN ingredient_types it ON i.ingredient_type_id = it.id;
  `;
  return rows;
}

export async function getRecipesByIngredient(ingredientName: string) {
  try {
    const { rows } = await sql<Recipe>`
      SELECT 
        r.id,
        r.image_url,
        r.name,
        json_build_object(
          'name', rt.name,
          'image_url', rt.image_url
        ) as type,
        r.stars,
        r.energy,
        r.sell_price,
        c.name as collection,
        (
          SELECT json_agg(
            CASE 
              WHEN jsonb_typeof(element) = 'array' THEN (
                SELECT json_agg(
                  json_build_object(
                    'name', i.name,
                    'image_url', i.image_url
                  )
                )
                FROM ingredients i
                WHERE i.id = ANY(SELECT jsonb_array_elements(element)::text::integer)
              )
              ELSE (
                SELECT json_build_object(
                  'name', i.name,
                  'image_url', i.image_url
                )
                FROM ingredients i
                WHERE i.id = element::text::integer
              )
            END
          )
          FROM jsonb_array_elements(r.ingredient_ids) element
        ) as ingredients
      FROM recipes r
      JOIN recipe_types rt ON r.type_id = rt.id
      JOIN collections c ON r.collection_id = c.id
      WHERE EXISTS (
        SELECT 1 FROM ingredients i
        WHERE i.name = ${ingredientName}
        AND (
          i.id = ANY(
            SELECT element::text::integer
            FROM jsonb_array_elements(r.ingredient_ids) element
            WHERE jsonb_typeof(element) = 'number'
          )
          OR
          i.id = ANY(
            SELECT jsonb_array_elements(element)::text::integer
            FROM jsonb_array_elements(r.ingredient_ids) element
            WHERE jsonb_typeof(element) = 'array'
          )
        )
      );
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch recipes by ingredient.');
  }
}

export async function getAllCritters() {
  try {
    const { rows } = await sql<Critter>`
      SELECT 
        c.id,
        c.name,
        c.image_url,
        ct.name as type,
        json_build_object(
          'name', l.name,
          'image_url', l.image_url
        ) as location,
        c.schedule
    FROM critters c
    JOIN critter_types ct ON c.critter_type_id = ct.id
    JOIN locations l ON ct.location_id = l.id;
  `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch critter data.');
  }
}
