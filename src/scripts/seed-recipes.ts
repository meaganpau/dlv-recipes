import path from 'path';
import { sql } from '@vercel/postgres';
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';
import { config } from 'dotenv';
import ingredientsJson from '../../data/ingredients.json';

type RecipeRow = [string, string, string, string, string, string, string, string];
type IngredientData = { name: string, image_url: string };
type Ingredients = (IngredientData | IngredientData[])[];

config({ path: path.resolve(process.cwd(), '.env.local') });

async function createTables() {
  // Drop all tables
  await sql`DROP TABLE IF EXISTS recipes`;
  await sql`DROP TABLE IF EXISTS ingredients`;
  await sql`DROP TABLE IF EXISTS ingredient_types`;
  await sql`DROP TABLE IF EXISTS recipe_types`;
  await sql`DROP TABLE IF EXISTS collections`;

  try {
    // 1. Create collections table
    await sql`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
    `;
    
    // 2. Create recipe_types table
    await sql`
      CREATE TABLE IF NOT EXISTS recipe_types (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        image_url TEXT NOT NULL
      );
    `;

    // 3. Create ingredient_type table
    await sql`
      CREATE TABLE IF NOT EXISTS ingredient_types (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        image_url TEXT NOT NULL
      );
    `;

    // 4. Create ingredients table
    await sql`
      CREATE TABLE IF NOT EXISTS ingredients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        image_url TEXT NOT NULL,
        ingredient_type_id INTEGER REFERENCES ingredient_types(id),
        is_generic BOOLEAN NOT NULL DEFAULT FALSE
      );
    `;

    // 5. Create recipes table
    await sql`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        image_url TEXT NOT NULL,
        name TEXT NOT NULL,
        type_id INTEGER REFERENCES recipe_types(id),
        collection_id INTEGER REFERENCES collections(id),
        ingredient_ids JSONB NOT NULL, -- Array of ingredient IDs or arrays of ingredient IDs (for optional ingredients)
        stars INTEGER NOT NULL,
        energy INTEGER NOT NULL,
        sell_price INTEGER NOT NULL
      );
    `;

    console.log('Created all tables');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

async function seedIngredients(ingredient: IngredientData) {
    // Get ingredient type image_url by looking up the ingredient name in the ingredients list in the ingredientsJson
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let ingredientType = Object.entries(ingredientsJson).find(([_, value]) => value.ingredients.includes(ingredient.name))?.[0];
    let isGeneric = false;

    // hardcode `Any Vegetables` to `Any Vegetable`
    if (ingredient.name === 'Any Vegetables') {
      ingredient.name = 'Any Vegetable';
    }

    if (!ingredientType) {
      // It must be a generic ingredient
      const genericTypeMap = {
        'Any Fruit': 'fruit',
        'Any Grain': 'grain',
        'Any Dairy or Oil': 'dairy_and_oil',
        'Any Fish': 'fish',
        'Any Meat': 'meat',
        'Any Seafood': 'seafood',
        'Any Spice': 'spices',
        'Any Sweet': 'sweets',
        'Any Vegetable': 'vegetables',
        'Any Vegetables': 'vegetables',
        'Any Ice': 'ice',
      }

      ingredientType = genericTypeMap[ingredient.name as keyof typeof genericTypeMap];
      if (!ingredientType) {
        console.error(`Invalid ingredient: "${ingredient.name}"`);
        // skip this ingredient
        return null;
      } else {
        isGeneric = true;
      }
    }

    const ingredientTypeName = ingredientsJson[ingredientType as keyof typeof ingredientsJson].name;
    const ingredientTypeImageUrl = ingredientsJson[ingredientType as keyof typeof ingredientsJson].image_url;

    // Insert or get ingredient type
    const ingredientTypeResult = await sql<{ id: number }>`
      INSERT INTO ingredient_types (name, image_url)
      VALUES (${ingredientTypeName}, ${ingredientTypeImageUrl})
      ON CONFLICT (name)
      DO UPDATE SET name = ingredient_types.name
      RETURNING id;
    `;
    const ingredientTypeId = ingredientTypeResult.rows[0].id;
    
    // Insert or get ingredient
    const ingredientResult = await sql<{ id: number }>`
      INSERT INTO ingredients (name, is_generic, image_url, ingredient_type_id)
      VALUES (${ingredient.name}, ${isGeneric}, ${ingredient.image_url}, ${ingredientTypeId})
      ON CONFLICT (name) 
      DO UPDATE SET name = ingredients.name
      RETURNING id;
    `;
  const ingredientId = ingredientResult.rows[0].id;
  
  return ingredientId;
}

export async function seedRecipes() {
  try {
    await createTables();

    const fileContent = await fs.readFile(path.resolve(process.cwd(), 'data/recipes.csv'), 'utf-8');
    const records = parse(fileContent, {
      columns: false,
      skip_empty_lines: true,
      // skip first row since it's the header
      from_line: 2
    }) as RecipeRow[];

    for (const record of records) {

      const [image_url, name, type, stars, energy, sell_price, ingredients, collection] = record;
      
      if (isNaN(parseInt(stars)) || isNaN(parseInt(energy)) || isNaN(parseInt(sell_price))) {
        console.error(`Invalid numeric values for recipe "${name}":`, {
          stars,
          energy,
          sell_price
        });
        continue;
      }

      const ingredientsData: Ingredients = JSON.parse(ingredients);
      const ingredientIds: (number[] | number)[] = [];

      for (const ingredient of ingredientsData) {
        if (Array.isArray(ingredient)) {
          const optionalIngredientIds: number[] = []
          for (const optionalIngredient of ingredient) {
            const ingredientId = await seedIngredients(optionalIngredient);
            if (ingredientId) {
              optionalIngredientIds.push(ingredientId);
            }
          }
          ingredientIds.push(optionalIngredientIds);
        } else {
          const ingredientId = await seedIngredients(ingredient);
          if (ingredientId) {
            ingredientIds.push(ingredientId);
          }
        }
      }

      // Insert or get collection
      const collectionResult = await sql<{ id: number }>`
        INSERT INTO collections (name)
        VALUES (${collection})
        ON CONFLICT (name) DO UPDATE SET name = collections.name
        RETURNING id;
      `;

      const collectionId = collectionResult.rows[0].id;

      // Insert or get type
      const typeResult = await sql<{ id: number }>`
        INSERT INTO recipe_types (name, image_url)
        VALUES (${JSON.parse(type).name}, ${JSON.parse(type).image_url})
        ON CONFLICT (name) DO UPDATE SET name = recipe_types.name
        RETURNING id;
      `;
      const typeId = typeResult.rows[0].id;

      // Insert recipe
      await sql<{ id: number }>`
        INSERT INTO recipes (
          image_url, name, type_id, collection_id, ingredient_ids, 
          stars, energy, sell_price
        ) VALUES (
          ${image_url},
          ${name},
          ${typeId},
          ${collectionId},
          ${JSON.stringify(ingredientIds)}::jsonb,
          ${parseInt(stars)},
          ${parseInt(energy)},
          ${parseInt(sell_price)}
        );
      `;
    }
    
    console.log('Seeded all tables');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

seedRecipes();