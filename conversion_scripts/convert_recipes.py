"""
Written by Zach Manson, based on the previous script by Harrison Oates

To use, get the recipes folder from the Minecraft source files and copy it into 
this folder.  Then run this script, which will output a single file, recipes.json.

Copy recipes.json into the data folder in app/static/data.

"""

import json, os
from pprint import pprint

# Converts tags to acceptable equivalent blocks
tag_map = {

}

files_to_skip = [
    
]

given_ingredients = json.load(open("../app/static/data/given_ingredients.json"))

def process_recipes(path):
    # Reads all recipe filenames (in minecraft.jar they are all seperate)
    recipe_filenames = [recipe for recipe in os.listdir(path) if recipe.endswith('.json')]
    new_recipes = {}

    for recipe_filename in recipe_filenames:
        print(f"{recipe_filename=}")

        # Load all shaped files
        jsonfile = json.load(open(os.path.join(path, recipe_filename)))
        extless_filename = recipe_filename[:recipe_filename.find(".")]
        if extless_filename in files_to_skip: continue
        if jsonfile["type"] != "minecraft:crafting_shaped": continue
        
        new_recipe = {
            "type": "",
            "group": "",
            "output": "",
            "count": 0,
            "input": []
        }

        new_recipe["type"] = jsonfile["type"]
        new_recipe["group"] = jsonfile.get("group", "")
        
        new_recipe["output"] = jsonfile["result"]["item"]
        new_recipe["count"] = jsonfile["result"]["count"] if "count" in list(jsonfile["result"].keys()) is not None else 1
        skip = False
        for row in jsonfile["pattern"]:
            new_row = []
            for char in row:
                if char == " ":
                    new_row.append(None)
                else:
                    key_item = jsonfile["key"][char]
                    if isinstance(key_item, list):
                        key_item = key_item[0]
                    itemname = key_item.get("item", None)
                    
                    # Convert tags to blocks
                    if itemname is None:
                        itemname = "#"+key_item.get("tag", None)
                        

                        
                    new_row.append(itemname)


            new_recipe["input"].append(new_row)
        
        if skip: continue
        new_recipes[extless_filename] = new_recipe

    return new_recipes


def create_recipes():
    processed_recipes = process_recipes("./recipes/")
    outputfilename = "./recipes-all.json"
    with open(outputfilename, "w") as write_file:
        json.dump(processed_recipes, write_file, indent = 4)

    print(f"Written {len(processed_recipes)} recipes to {outputfilename}")

def create_all_items():
    recipes = json.load(open("./recipes.json"))
    recipes_outputs = [value["output"] for value in recipes.values()]
    all_items = json.load(open("./all_items.json"))

    items = {key:value for key,value in all_items.items() if (key in recipes_outputs) or (key in given_ingredients)}
    
    outputfilename = "./items.json"
    with open(outputfilename, "w") as write_file:
        json.dump(items, write_file, indent = 4)
    print(f"Written {len(items)} recipes to {outputfilename}")


if __name__ == "__main__":
    create_recipes()
    create_all_items()
