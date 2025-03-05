export interface Critter {
    id: number;
    name: string;
    image_url: string;
    type: string;
    location: {
        name: string;
        image_url: string;
    };
    schedule: {
        sunday: string | boolean;
        monday: string | boolean;
        tuesday: string | boolean;
        wednesday: string | boolean;
        thursday: string | boolean;
        friday: string | boolean;
        saturday: string | boolean;
    };
}