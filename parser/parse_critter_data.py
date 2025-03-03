from bs4 import BeautifulSoup
import json
import os
from typing import Dict, List, Optional, TypedDict, Union
import re

class Schedule(TypedDict, total=False):
    sunday: Union[str, bool]
    monday: Union[str, bool]
    tuesday: Union[str, bool]
    wednesday: Union[str, bool]
    thursday: Union[str, bool]
    friday: Union[str, bool]
    saturday: Union[str, bool]

class FavFood(TypedDict, total=False):
    ingredient: str
    item: str
    name: str

class LikedFood(TypedDict, total=False):
    generic_ingredient: str
    specific_ingredients: List[str]
    generic_item: str
    location: str
    name: str

class Reward(TypedDict):
    quantity: Optional[str]
    item: Optional[str]
    ingredient: Optional[str]

class Location(TypedDict):
    name: str
    image_url: Optional[str]

class CritterType(TypedDict):
    name: str
    fav_food: List[FavFood]
    liked_food: List[LikedFood]
    location: str
    fav_food_reward: List[Reward]
    liked_food_reward: List[Reward]

class Critter(TypedDict):
    image_url: str
    name: str
    type: str
    location: str
    schedule: Schedule

BASE_URL = 'https://dreamlightvalleywiki.com'

CRITTER_TYPE_MAP = {
    'Crocodile': {
        'plural': 'Crocodiles',
        'types': ['Blue Crocodile', 'Classic Crocodile', 'Red Crocodile', 'Pink Crocodile', 'Golden Crocodile', 'White Crocodile'],
    },
    'Sunbird': {
        'plural': 'Sunbirds',
        'types': ['Emerald Sunbird', 'Golden Sunbird', 'Orchid Sunbird', 'Red Sunbird', 'Turquoise Sunbird'],
    },
    'Squirrel': {
        'plural': 'Squirrels',
        'types': ['Classic Squirrel', 'Red Squirrel', 'White Squirrel', 'Black Squirrel', 'Gray Squirrel'],
    },
    'Rabbit': {
        'plural': 'Rabbits',
        'types': ['Classic Rabbit', 'Brown Rabbit', 'White Rabbit', 'Black Rabbit', 'Calico Rabbit'],
    },
    'Raven': {
        'plural': 'Ravens',
        'types': ['Classic Raven', 'Red Raven', 'White Raven', 'Brown Raven', 'Blue Raven'],
    },
    'Sea Turtle': {
        'plural': 'Sea Turtles',
        'types': ['Classic Sea Turtle', 'Purple Sea Turtle', 'White Sea Turtle', 'Brown Sea Turtle', 'Black Sea Turtle'],
    },
    'Fox': {
        'plural': 'Foxes',
        'types': ['Classic Fox', 'Red Fox', 'White Fox', 'Blue Fox', 'Black Fox'],
    },
    'Raccoon': {
        'plural': 'Raccoons',
        'types': ['Classic Raccoon', 'Red Raccoon', 'White Raccoon', 'Blue Raccoon', 'Black Raccoon'],
    },
    'Capybara': {
        'plural': 'Capybaras',
        'types': ['Classic Capybara', 'Red and White Striped Capybara', 'Toon Capybara', 'Gray Spotted Capybara', 'Black and White Capybara', 'Blue Striped Capybara'],
    },
    'Cobra': {
        'plural': 'Cobras',
        'types': ['Classic Cobra', 'Blue and Red Striped Cobra', 'Green and White Striped Cobra', 'Pink Spotted Cobra', 'Toon Cobra', 'Yellow and Purple Striped Cobra'],
    },
    'Monkey': {
        'plural': 'Monkeys',
        'types': ['Classic Monkey', 'Red and Beige Monkey', 'Toon Monkey', 'Black and Gray Monkey', 'Black and Brown Monkey', 'Beige Monkey'],
    },
    'Owl': {
        'plural': 'Owls',
        'types': ['Brown Owl', 'Dark Owl', 'Light Owl', 'Purple Owl'],
    },
    'Baby Dragon': {
        'plural': 'Baby Dragons',
        'types': ['Blue Baby Dragon', 'Red Baby Dragon', 'Green Baby Dragon', 'Purple Baby Dragon'],
    },
    'Baby Pegasus': {
        'plural': 'Baby Pegasi',
        'types': ['Blue Pegasus', 'Peach Pegasus', 'Pink Pegasus', 'Yellow Pegasus'],
    }    
}

def parse_schedule(row) -> Schedule:
    """Parse the schedule from a row in the schedule table."""
    days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    schedule: Schedule = {}
    
    for i, day in enumerate(days):
        cell = row.find_all('td')[i + 3]  # +3 because first 3 columns are image, name, location
        text = cell.get_text(strip=True)
        
        if text == 'n/a':
            continue
        elif text == 'All day':
            schedule[day] = True
        else:
            schedule[day] = text
            
    return schedule

def parse_food_rewards(cell) -> List[Reward]:
    """Parse food rewards from a cell."""
    rewards = []
    items = cell.find_all("span", {"id": "nametemplate"})
    
    for item in items:
        name = item.find('a').get_text(strip=True)
        if not name:
            continue
            
        # Look for quantity in parentheses
        quantity_text = item.get_text(strip=True)
        quantity_match = re.search(r'\((\d+(?:-\d+)?)\)', quantity_text)
        quantity = quantity_match.group(1) if quantity_match else '1'
        
        rewards.append({
            'quantity': quantity,
            'item': name,  # This should be mapped to actual IDs
        })
    
    return rewards

def parse_food_items(cell) -> tuple[List[FavFood], List[LikedFood]]:
    """Parse food items from a cell."""
    fav_food: List[FavFood] = []
    liked_food: List[LikedFood] = []
    
    # Parse favorite food
    fav_links = cell.find_all('a')
    for link in fav_links:
        name = link.get_text(strip=True)
        if name:
            fav_food.append({'name': name})
    
    # Parse liked food
    liked_links = cell.find_all('a')
    for link in liked_links:
        name = link.get_text(strip=True)
        if name:
            liked_food.append({'name': name})
    
    return fav_food, liked_food

def extract_clean_text(cell) -> str:
    """Extract clean text from a cell, removing citations and handling both linked and plain text."""
    # First try to find a direct link
    link = cell.find('a')
    if link and not link.find_parent('sup'):  # Only use link text if it's not inside a citation
        return link.get_text(strip=True)
    
    # If no direct link or it's a citation, get all text and remove citation markers
    text = cell.get_text(strip=True)
    # Remove citation markers like [1], [2], etc.
    text = re.sub(r'\[\d+\]', '', text)
    return text.strip()

def extract_location(cell) -> Optional[Location]:
    """Extract location information from a cell."""
    link = cell.find('a')
    if not link:
        return None
        
    name = extract_clean_text(cell)
    if not name or name == 'n/a':
        return None
        
    img = cell.find('img')
    image_url = BASE_URL + img['src'] if img else None
    
    return {
        'name': name,
        'image_url': image_url
    }

def main():
    # Read HTML files
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    
    with open(os.path.join(data_dir, 'critter-type-table.html'), 'r', encoding='utf-8') as f:
        type_soup = BeautifulSoup(f.read(), 'html.parser')
    
    with open(os.path.join(data_dir, 'critter-schedule-table.html'), 'r', encoding='utf-8') as f:
        schedule_soup = BeautifulSoup(f.read(), 'html.parser')
    
    critter_types: List[CritterType] = []
    critters: List[Critter] = []
    locations: Dict[str, Location] = {}  # Using dict to ensure uniqueness
    
    # Process type table
    type_rows = type_soup.select('tbody tr')
    for row in type_rows:
        cells = row.find_all('td')
        if len(cells) < 8:  # Skip rows that don't have all columns
            continue
            
        name = extract_clean_text(cells[1])
        location_cell = cells[4]
        location_data = extract_location(location_cell)
        if location_data:
            locations[location_data['name']] = location_data
            
        fav_food, liked_food = parse_food_items(cells[2])
        fav_rewards = parse_food_rewards(cells[6])
        liked_rewards = parse_food_rewards(cells[7])
        
        if name and location_data:
            critter_types.append({
                'name': get_critter_type_from_type_name(name),
                'location': location_data['name'],
                'fav_food': fav_food,
                'liked_food': liked_food,
                'fav_food_reward': fav_rewards,
                'liked_food_reward': liked_rewards
            })
    
    # Process schedule table
    schedule_rows = schedule_soup.select('tbody tr')
    for row in schedule_rows:
        cells = row.find_all('td')
        if len(cells) < 10:  # Skip rows that don't have all columns
            print(f"Skipping row {cells[1].get_text(strip=True)}")
            continue
            
        img = cells[0].find('img')
        image_url = img['src'] if img else None
        name = extract_clean_text(cells[1])
        location_cell = cells[2]
        location_data = extract_location(location_cell)
        if location_data:
            locations[location_data['name']] = location_data
            
        schedule = parse_schedule(row)
        type = get_critter_type(name)
        
        if name and location_data and image_url:
            critters.append({
                'image_url': BASE_URL + image_url,
                'name': name,
                'type': type,
                'location': location_data['name'],
                'schedule': schedule
            })
    
    # Write output files
    with open(os.path.join(data_dir, 'critter-types.json'), 'w', encoding='utf-8') as f:
        json.dump(critter_types, f, indent=2, ensure_ascii=False)
    
    with open(os.path.join(data_dir, 'critters.json'), 'w', encoding='utf-8') as f:
        json.dump(critters, f, indent=2, ensure_ascii=False)
        
    # Convert locations dict to list and write to file
    locations_list = list(locations.values())
    with open(os.path.join(data_dir, 'locations.json'), 'w', encoding='utf-8') as f:
        json.dump(locations_list, f, indent=2, ensure_ascii=False)
    
    print('Successfully parsed critter data and saved to JSON files')

def get_critter_type(name: str) -> str:
    """Get the critter type from the name."""
    for critter_type, details in CRITTER_TYPE_MAP.items():
        if name in details['types']:
            return critter_type
    return None

def get_critter_type_from_type_name(name: str) -> str:
    """Get the critter type from the type name."""
    for critter_type, details in CRITTER_TYPE_MAP.items():
        if name.lower() == critter_type.lower():
            return critter_type
        if name.lower() == details['plural'].lower():
            return critter_type
        if name in details['types']:
            return critter_type
    print(f"No critter type found for {name}")
    return None

if __name__ == '__main__':
    main() 