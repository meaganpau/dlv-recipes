from bs4 import BeautifulSoup
import json
import re

def clean_text(text):
    # Remove extra whitespace and newlines
    return re.sub(r'\s+', ' ', text).strip()

def parse_ingredients_table(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find all table headers to get categories
    headers = soup.find_all('th', class_='headerSort')

    categories = []
    for header in headers:
        # Extract category name from the last <a> tag in the header
        category_link = header.find_all('a')[-1]
        categories.append(category_link.text)
    
    # Find all table cells (td) containing ingredients
    cells = soup.find_all('td')

    ingredients_by_category = {}
    
    # Process each cell (column) with its corresponding category
    for category, cell in zip(categories, cells):
        ingredients = []
        # Find all ingredient links
        for ingredient_link in cell.find_all('a'):
            ingredients.append(ingredient_link.text)
        
        ingredients_by_category[category] = ingredients
    
    return ingredients_by_category

# Example usage:
with open('ingredients-table.html', 'r', encoding='utf-8') as file:
    html_content = file.read()

ingredients_json = parse_ingredients_table(html_content)

# Write to JSON file with pretty printing
with open('ingredients.json', 'w', encoding='utf-8') as f:
    json.dump(ingredients_json, f, indent=2, ensure_ascii=False)