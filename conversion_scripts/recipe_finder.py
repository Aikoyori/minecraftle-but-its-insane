import os,json
def recusive_tag_finder(tag,v):
    if(tag.startswith("#")):
        print("WITH TAG "+tag)
        with open("./tags/"+tag.split(":")[1]+".json", "r") as f:
            tag = json.load(f)
            for tagfind in tag["values"]:
                
                print("RESOLVES INTO " + tagfind)
                recusive_tag_finder(tagfind,v)
    else:
        print(tag)
        valid_ingredients_with_count_tag_resolved.setdefault(tag, 0)
        
        valid_ingredients_with_count_tag_resolved[tag] += v

recipes_f = [rec for rec in os.listdir("./recipes/") if rec.endswith('.json')]
tags_f = [tag for tag in os.listdir("./tags/") if tag.endswith('.json')]

valid_ingredients_with_count = {}
valid_ingredients_with_count_tag_resolved = {}
valid_ingredients_with_tags = []
valid_ingredients_tag_resolved = []
valid_ingredients_tag_only = []
valid_ingredients_nontag_only = []
for i in recipes_f:
    with open("./recipes/"+i, "r") as f:
        recipe = json.load(f)
        if(recipe['type']=="minecraft:crafting_shaped"):
            for entry in recipe["key"].values():
                if(len(entry)>1):
                    for entry2 in entry:
                        
                        entry2222 = {}
                        
                        for k,v in entry2.items():
                            if(k == "tag"):
                                entry2222[k] = "#"+v
                            else:
                                entry2222[k] = v
                        for actual in entry2222.values():
                            valid_ingredients_with_count.setdefault(actual, 0)
                            valid_ingredients_with_count[actual]+=1
                else:
                    entry2222 = {}
                    
                    for k,v in entry.items():
                        if(k == "tag"):
                            entry2222[k] = "#"+v
                        else:
                            entry2222[k] = v
                    print(entry2222)
                    for actual in entry2222.values():
                        valid_ingredients_with_count.setdefault(actual, 0)
                        valid_ingredients_with_count[actual]+=1
        if( recipe['type']=="minecraft:crafting_shapeless"):
            for entryx in recipe["ingredients"]:
                print(entryx)
                if(len(entryx)>1):
                    for entry in entryx:
                        for k,v in entry.items():
                            entry2 = ""
                            if(k == "tag"):
                                entry2 = "#"+v
                            else:
                                entry2 = v
                            valid_ingredients_with_count.setdefault(entry2, 0)
                            valid_ingredients_with_count[entry2]+=1
                else:
                    for k,v in entryx.items():
                        entry2 = ""
                        if(k == "tag"):
                            entry2 = "#"+v
                        else:
                            entry2 = v
                        valid_ingredients_with_count.setdefault(entry2, 0)
                        valid_ingredients_with_count[entry2]+=1

for k,v in valid_ingredients_with_count.items():
    recusive_tag_finder(k,v)
# sort keys by value into list
valid_key_list = dict(sorted(valid_ingredients_with_count_tag_resolved.items(),key=lambda item: item[0], reverse=True)).keys()
valid_key_list = dict(sorted(valid_ingredients_with_count_tag_resolved.items(),key=lambda item: item[1], reverse=True)).keys()
print(valid_key_list)



