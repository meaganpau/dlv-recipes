import { Ingredient } from './ingredient';

export interface Recipe {
    id: number;
    image_url: string;
    name: string;
    type: {
        name: string;
        image_url: string;
    };
    stars: number;
    energy: number;
    sell_price: number;
    ingredients: (Ingredient | Ingredient[])[];
    collection: string;
}