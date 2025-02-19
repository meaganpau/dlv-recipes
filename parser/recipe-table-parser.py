from bs4 import BeautifulSoup
import csv
import json
import re

def count_stars(star_text):
    return len(star_text.strip())

def clean_number(text):
    # Remove commas and any non-digit characters except minus sign
    return re.sub(r'[^\d-]', '', text)

def extract_image_url(img_tag):
    if not img_tag:
        return None
    
    base_url = 'https://dreamlightvalleywiki.com'
    srcset = img_tag.get('srcset', '')
    
    if srcset:
        # Get the highest resolution image from srcset
        urls = srcset.split(', ')
        if urls:
            last_url = urls[-1].split()[0]
            return base_url + last_url if last_url.startswith('/') else base_url + '/' + last_url
    
    src = img_tag.get('src')
    if src:
        return base_url + src if src.startswith('/') else base_url + '/' + src
    
    return None

def parse_ingredients(td):
    # Example ingredients table cell:
    # <td>
    # <p><span id="nametemplate"><a href="/Category:Fruit" title="Category:Fruit"><img alt="Fruit.png" src="/images/thumb/a/a0/Fruit.png/20px-Fruit.png" decoding="async" loading="lazy" width="20" height="20" srcset="/images/thumb/a/a0/Fruit.png/30px-Fruit.png 1.5x, /images/thumb/a/a0/Fruit.png/40px-Fruit.png 2x"></a> <a href="/Category:Fruit" title="Category:Fruit">Any Fruit</a></span><br>
    # </p>
    # <ul><li><span id="nametemplate"><span id="name-space" style="width:;"><img alt="" src="/images/thumb/2/2f/Coconut.png/20px-Coconut.png" decoding="async" loading="lazy" width="20" height="20" srcset="/images/thumb/2/2f/Coconut.png/30px-Coconut.png 1.5x, /images/thumb/2/2f/Coconut.png/40px-Coconut.png 2x"></span> <a href="/Coconut" title="Coconut">Coconut</a></span></li>
    # <li><span id="nametemplate"><span id="name-space" style="width:;"><img alt="" src="/images/thumb/3/33/Coffee_Bean.png/17px-Coffee_Bean.png" decoding="async" loading="lazy" width="17" height="20" srcset="/images/thumb/3/33/Coffee_Bean.png/25px-Coffee_Bean.png 1.5x, /images/thumb/3/33/Coffee_Bean.png/33px-Coffee_Bean.png 2x"></span> <a href="/Coffee_Bean" title="Coffee Bean">Coffee Bean</a></span></li>
    # <li><span id="nametemplate"><span id="name-space" style="width:;"><img alt="" src="/images/thumb/3/35/Lemon.png/20px-Lemon.png" decoding="async" loading="lazy" width="20" height="20" srcset="/images/thumb/3/35/Lemon.png/30px-Lemon.png 1.5x, /images/thumb/3/35/Lemon.png/40px-Lemon.png 2x"></span> <a href="/Lemon" title="Lemon">Lemon</a></span></li>
    # <li><span id="nametemplate"><span id="name-space" style="width:;"><img alt="" src="/images/thumb/1/1f/Raspberry.png/20px-Raspberry.png" decoding="async" loading="lazy" width="20" height="20" srcset="/images/thumb/1/1f/Raspberry.png/30px-Raspberry.png 1.5x, /images/thumb/1/1f/Raspberry.png/40px-Raspberry.png 2x"></span> <a href="/Raspberry" title="Raspberry">Raspberry</a></span></li>
    # <li><span id="nametemplate"><span id="name-space" style="width:;"><img alt="" src="/images/thumb/3/39/Grapes.png/20px-Grapes.png" decoding="async" loading="lazy" width="20" height="12" srcset="/images/thumb/3/39/Grapes.png/30px-Grapes.png 1.5x, /images/thumb/3/39/Grapes.png/40px-Grapes.png 2x"></span> <a href="/Grapes" title="Grapes">Grapes</a></span></li></ul>
    # <p><span id="nametemplate"><span id="name-space" style="width:;"><img alt="" src="/images/thumb/e/e2/Wheat.png/20px-Wheat.png" decoding="async" loading="lazy" width="20" height="20" srcset="/images/thumb/e/e2/Wheat.png/30px-Wheat.png 1.5x, /images/thumb/e/e2/Wheat.png/40px-Wheat.png 2x"></span> <a href="/Wheat" title="Wheat">Wheat</a></span><br>
    # <span id="nametemplate"><span id="name-space" style="width:;"><img alt="" src="/images/thumb/f/f1/Butter.png/20px-Butter.png" decoding="async" loading="lazy" width="20" height="20" srcset="/images/thumb/f/f1/Butter.png/30px-Butter.png 1.5x, /images/thumb/f/f1/Butter.png/40px-Butter.png 2x"></span> <a href="/Butter" title="Butter">Butter</a></span>
    # </p>
    # </td>
    # Another example: 
    # <td><span id="nametemplate"><span id="name-space" style="width:;"><img alt="" src="/images/thumb/6/6a/Dreamlight_Fruit.png/14px-Dreamlight_Fruit.png" decoding="async" loading="lazy" width="14" height="20" srcset="/images/thumb/6/6a/Dreamlight_Fruit.png/21px-Dreamlight_Fruit.png 1.5x, /images/thumb/6/6a/Dreamlight_Fruit.png/28px-Dreamlight_Fruit.png 2x"></span> <a href="/Dreamlight_Fruit" title="Dreamlight Fruit">Dreamlight Fruit</a></span><br><span id="nametemplate"><span id="name-space" style="width:;"><img alt="" src="/images/thumb/9/92/Milk.png/20px-Milk.png" decoding="async" loading="lazy" width="20" height="20" srcset="/images/thumb/9/92/Milk.png/30px-Milk.png 1.5x, /images/thumb/9/92/Milk.png/40px-Milk.png 2x"></span> <a href="/Milk" title="Milk">Milk</a></span><br><span id="nametemplate"><span id="name-space" style="width:;"><img alt="" src="/images/thumb/c/c0/Slush_Ice.png/20px-Slush_Ice.png" decoding="async" loading="lazy" width="20" height="20" srcset="/images/thumb/c/c0/Slush_Ice.png/30px-Slush_Ice.png 1.5x, /images/thumb/c/c0/Slush_Ice.png/40px-Slush_Ice.png 2x"></span> <a href="/Slush_Ice" title="Slush Ice">Slush Ice</a></span></td>

    # for each ingredient in a table cell, there could be a mandatory or optional ingredient
    # if there is an <ul> tag, then there are optional ingredients
    # if there is a <span> tag outside of a ul tag, then there is a mandatory ingredient
    # exclude the "Any" ingredients

    # so ingredients for example #1 would be [
    #   [{
    #     "name": "Coconut",
    #     "image_url": "https://dreamlightvalleywiki.com/images/thumb/2/2f/Coconut.png/20px-Coconut.png"
    #   },
    #   {
    #     "name": "Coffee Bean",
    #     "image_url": "https://dreamlightvalleywiki.com/images/thumb/3/33/Coffee_Bean.png/17px-Coffee_Bean.png"
    #   },
    #  {
    #     "name": "Lemon",
    #     "image_url": "https://dreamlightvalleywiki.com/images/thumb/3/35/Lemon.png/20px-Lemon.png"
    #   },
    #   {
    #     "name": "Raspberry",
    #     "image_url": "https://dreamlightvalleywiki.com/images/thumb/1/1f/Raspberry.png/20px-Raspberry.png"
    #   },
    #   {
    #     "name": "Grapes",
    #     "image_url": "https://dreamlightvalleywiki.com/images/thumb/3/39/Grapes.png/20px-Grapes.png"
    #   }],
    #  {
    #     "name": "Wheat",
    #     "image_url": "https://dreamlightvalleywiki.com/images/thumb/e/e2/Wheat.png/20px-Wheat.png"
    #   },
    #  {
    #     "name": "Butter",
    #     "image_url": "https://dreamlightvalleywiki.com/images/thumb/f/f1/Butter.png/20px-Butter.png"
    #   }
    # ]

    # so ingredients for example #2 would be [
    #   {
    #     "name": "Dreamlight Fruit",
    #     "image_url": "https://dreamlightvalleywiki.com/images/thumb/6/6a/Dreamlight_Fruit.png/14px-Dreamlight_Fruit.png"
    #   },
    #   {
    #     "name": "Milk",
    #     "image_url": "https://dreamlightvalleywiki.com/images/thumb/9/92/Milk.png/20px-Milk.png"
    #   },
    #   {
    #     "name": "Slush Ice",
    #     "image_url": "https://dreamlightvalleywiki.com/images/thumb/c/c0/Slush_Ice.png/20px-Slush_Ice.png"
    #   }
    # ]
    
    ingredients = []
    optional_ingredients = []

    # Find all elements with id=nametemplate within the td that are not a child of ul/li
    for span in td.find_all('span', id='nametemplate'):
        if span.parent.name != 'ul' and span.parent.name != 'li':
            img = span.find('img')
            img_url = extract_image_url(img)
            name = span.find('a').text if span.find('a') else span.get_text(strip=True)
            
        if name != "":
            ingredients.append({
                'name': name,
                'image_url': img_url
            })
    
    # Find optional ingredients in ul lists
    ul = td.find('ul')
    if ul:
        for li in ul.find_all('li'):
            span = li.find('span', id='nametemplate')
            if span:
                img = span.find('img')
                img_url = extract_image_url(img)
                name = span.find('a').text if span.find('a') else span.get_text(strip=True)
                
                optional_ingredients.append({
                    'name': name,
                    'image_url': img_url
                })
    
    # If we have optional ingredients, make them the first element in the list
    if optional_ingredients:
        return [optional_ingredients] + ingredients
    return ingredients

def parse_table(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    table = soup.find('table')
    rows = []
    
    for tr in table.find_all('tr')[1:]:  # Skip header row
        cols = tr.find_all('td')
        if not cols:
            continue
            
        # Image
        main_img = cols[0].find('img')
        image_url = extract_image_url(main_img)
        
        # Name (remove hyperlink)
        name = cols[1].get_text(strip=True)
        
        # Type (create object with name and image)
        type_span = cols[2].find('span')
        type_img = type_span.find('img')
        type_name = type_span.get_text(strip=True)
        type_data = {
            'name': type_name,
            'image_url': extract_image_url(type_img)
        }
        
        # Stars (convert to number)
        stars_span = cols[3].find('span', id='star-color')
        if stars_span:
            stars_text = stars_span.get_text(strip=True)
            stars_count = count_stars(stars_text)
        else:
            stars_count = None
        
        # Energy
        energy = clean_number(cols[4].get_text(strip=True))
        
        # Sell Price
        sell_price = clean_number(cols[5].get_text(strip=True))
        
        # Ingredients
        ingredients = parse_ingredients(cols[6])
        
        # Collection
        collection = cols[7].get_text(strip=True)
        
        row = {
            'image_url': image_url,
            'name': name,
            'type': type_data,
            'stars': stars_count,
            'energy': int(energy) if energy else None,
            'sell_price': int(sell_price) if sell_price else None,
            'ingredients': ingredients,
            'collection': collection
        }
        rows.append(row)
    
    return rows

def save_to_csv(rows, output_file):
    if not rows:
        return
    
    fieldnames = rows[0].keys()
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            # Convert objects/lists to JSON strings for CSV
            row_copy = row.copy()
            row_copy['type'] = json.dumps(row_copy['type'])
            row_copy['ingredients'] = json.dumps(row_copy['ingredients'])
            writer.writerow(row_copy)

def convert_html_file_to_csv(input_file, output_file):
    # Read the HTML file
    with open(input_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Parse and convert
    rows = parse_table(html_content)
    save_to_csv(rows, output_file)

# Usage example
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 3:
        print("Usage: python script.py input.html output.csv")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    convert_html_file_to_csv(input_file, output_file)