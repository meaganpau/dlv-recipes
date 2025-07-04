import path from 'path';
import { sql } from '@vercel/postgres';
import { config } from 'dotenv';
import fs from 'fs/promises';
config({ path: path.resolve(process.cwd(), '.env.local') });


async function createTables() {
  // Drop all tables
  await sql`DROP TABLE IF EXISTS critters`;
  await sql`DROP TABLE IF EXISTS critter_types`;
  await sql`DROP TABLE IF EXISTS locations`;
//   await sql`DROP TABLE IF EXISTS items`;

  try {
    await sql`CREATE TABLE locations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        image_url TEXT
    )`;

    await sql`CREATE TABLE critter_types (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location_id INTEGER REFERENCES locations(id)
    )`;

    await sql`CREATE TABLE critters (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        critter_type_id INTEGER REFERENCES critter_types(id),
        image_url TEXT,
        schedule JSONB NOT NULL
    )`;
  
    console.log('Created all tables');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

export async function seedCritters() {
    await createTables();
    // Import locations first
    const locations = await fs.readFile(path.resolve(process.cwd(), 'data/locations.json'), 'utf8');
    const locationsData = JSON.parse(locations);

    for (const location of locationsData) {
        await sql`INSERT INTO locations (name, image_url) VALUES (${location.name}, ${location.image_url})`;
    }

    // Import critter types
    // If the critter location name matches one from the locations table, use the location ID
    // Otherwise, print an error
    const critterTypes = await fs.readFile(path.resolve(process.cwd(), 'data/critter-types.json'), 'utf8');
    const critterTypesData = JSON.parse(critterTypes);

    for (const critterType of critterTypesData) {
        const location = await sql`SELECT id FROM locations WHERE name = ${critterType.location}`;
        if (!location || !location.rows[0]?.id) {
            console.error(`Location ${critterType.location} not found for ${critterType.name}`);
        }
        const locationId = location.rows[0].id;
        await sql`INSERT INTO critter_types (name, location_id) VALUES (${critterType.name}, ${locationId})`;
    }

    // Import critters
    // If the critter type matches one from the critter_types table, use the critter type ID
    // Otherwise, print an error
    const critters = await fs.readFile(path.resolve(process.cwd(), 'data/critters.json'), 'utf8');
    const crittersData = JSON.parse(critters);

    for (const critter of crittersData) {
        const critterType = await sql`SELECT id FROM critter_types WHERE name = ${critter.type}`;
        if (!critterType || !critterType.rows[0]?.id) {
            console.error(`Critter type ${critter.type} not found for ${critter.name}`);
        }
        const critterTypeId = critterType.rows[0].id;
        await sql`INSERT INTO critters (name, critter_type_id, image_url, schedule) VALUES (${critter.name}, ${critterTypeId}, ${critter.image_url}, ${critter.schedule})`;
    }

    console.log('Critters seeded successfully');
}

seedCritters();