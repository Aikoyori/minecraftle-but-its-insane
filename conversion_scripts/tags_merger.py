import json,os

if __name__ == "__main__":
    path = "./tags/"
    blocks_to_tags = {}

    
    tag_files = [tag for tag in os.listdir(path) if tag.endswith('.json')]
    
    for tag_file in tag_files:
        # merge all tags into one dict by using each element in tag as key and tag as value file name is a tag and in each file it has a list of items in "values" key as list
        tag = tag_file.split(".")[0]
        with open(path + tag_file, "r") as f:
            tag_items = json.load(f)["values"]
            for item in tag_items:
                if item not in blocks_to_tags:
                    blocks_to_tags[item] = []
                blocks_to_tags[item].append("#minecraft:"+tag)
    with open("./tag_merged.json", "w") as f:
        json.dump(blocks_to_tags, f, indent = 4)
