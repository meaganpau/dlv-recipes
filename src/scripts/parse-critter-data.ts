import { JSDOM } from 'jsdom';
import { promises as fs } from 'fs';
import path from 'path';

type CritterData = {
    image_url: string;
    name: string;
    type_id: string;
    location_id: string;
    schedule: {
        sunday?: string | boolean;
        monday?: string | boolean;
        tuesday?: string | boolean;
        wednesday?: string | boolean;
        thursday?: string | boolean;
        friday?: string | boolean;
        saturday?: string | boolean;
    }
}

type CritterTypeData = {
    name: string;
    fav_food: FavFood[];
    liked_food: LikedFood[];
    location_id: string;
    fav_food_reward: Reward[];
    liked_food_reward: Reward[];
}

type FavFood = 
    { ingredient_id: string; item_id?: never; name?: never; } |
    { ingredient_id?: never; item_id: string; name?: never; } |
    { ingredient_id?: never; item_id?: never; name: string; }

type LikedFood = {
    generic_ingredient_id?: string;
    specific_ingredient_ids?: string[]
    generic_item_id?: string;
    location_id?: string
} | { name: string }

type Reward = {
    quantity?: string;
} & (
    { item_id: string; ingredient_id?: never; } |
    { item_id?: never; ingredient_id: string; }
);

async function parseHTML(filePath: string): Promise<Document> {
    const html = await fs.readFile(filePath, 'utf-8');
    const dom = new JSDOM(html);
    return dom.window.document;
}

function parseSchedule(row: Element): CritterData['schedule'] {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const schedule: CritterData['schedule'] = {};

    days.forEach((day, index) => {
        const cell = row.cells[index + 3]; // +3 because first 3 columns are image, name, location
        const text = cell.textContent?.trim();
        
        if (text === 'n/a') {
            return;
        } else if (text === 'All day') {
            schedule[day as keyof CritterData['schedule']] = true;
        } else {
            schedule[day as keyof CritterData['schedule']] = text || undefined;
        }
    });

    return schedule;
}

function parseFoodRewards(cell: Element): Reward[] {
    const rewards: Reward[] = [];
    const items = cell.querySelectorAll('a');
    
    items.forEach(item => {
        const name = item.textContent?.trim();
        if (!name) return;

        const quantityMatch = cell.textContent?.match(/\((\d+(?:-\d+)?)\)/);
        const quantity = quantityMatch ? quantityMatch[1] : undefined;

        // This is a simplified version - you'll need to map actual item/ingredient IDs
        rewards.push({
            quantity,
            item_id: name // This should be mapped to actual IDs
        });
    });

    return rewards;
}

function parseFoodItems(cell: Element): { fav: FavFood[], liked: LikedFood[] } {
    const favFood: FavFood[] = [];
    const likedFood: LikedFood[] = [];

    // Parse favorite food
    const favLinks = cell.querySelectorAll('a');
    favLinks.forEach(link => {
        const name = link.textContent?.trim();
        if (name) {
            favFood.push({ name });
        }
    });

    // Parse liked food - this is more complex and needs proper categorization
    const likedLinks = cell.querySelectorAll('a');
    likedLinks.forEach(link => {
        const name = link.textContent?.trim();
        if (name) {
            likedFood.push({ name });
        }
    });

    return { fav: favFood, liked: likedFood };
}

async function main() {
    try {
        // Parse both HTML files
        const typeTable = await parseHTML(path.resolve(process.cwd(), 'data/critter-type-table.html'));
        const scheduleTable = await parseHTML(path.resolve(process.cwd(), 'data/critter-schedule-table.html'));

        const critterTypes: CritterTypeData[] = [];
        const critters: CritterData[] = [];

        // Process type table
        const typeRows = typeTable.querySelectorAll('tbody tr');
        typeRows.forEach(row => {
            const name = row.cells[1].textContent?.trim();
            const location = row.cells[4].querySelector('a')?.textContent?.trim();
            const { fav, liked } = parseFoodItems(row.cells[2]);
            const favRewards = parseFoodRewards(row.cells[6]);
            const likedRewards = parseFoodRewards(row.cells[7]);

            if (name && location) {
                critterTypes.push({
                    name,
                    location_id: location,
                    fav_food: fav,
                    liked_food: liked,
                    fav_food_reward: favRewards,
                    liked_food_reward: likedRewards
                });
            }
        });

        // Process schedule table
        const scheduleRows = scheduleTable.querySelectorAll('tbody tr');
        scheduleRows.forEach(row => {
            const imageUrl = row.cells[0].querySelector('img')?.src;
            const name = row.cells[1].textContent?.trim();
            const location = row.cells[2].querySelector('a')?.textContent?.trim();
            const schedule = parseSchedule(row);

            if (name && location && imageUrl) {
                critters.push({
                    image_url: imageUrl,
                    name,
                    type_id: name, // This should be mapped to the actual type ID
                    location_id: location,
                    schedule
                });
            }
        });

        // Write the data to JSON files
        await fs.writeFile(
            path.resolve(process.cwd(), 'data/critter-types.json'),
            JSON.stringify(critterTypes, null, 2)
        );
        await fs.writeFile(
            path.resolve(process.cwd(), 'data/critters.json'),
            JSON.stringify(critters, null, 2)
        );

        console.log('Successfully parsed critter data and saved to JSON files');
    } catch (error) {
        console.error('Error parsing critter data:', error);
    }
}

main(); 