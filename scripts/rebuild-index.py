#!/usr/bin/env python3
"""
Rebuild skills-index.json from skills-data.json.
Reconstructs slugIndex, categoryIndex, tagIndex, languageIndex, and aggregates.
"""
import json
from collections import defaultdict
from datetime import datetime, timezone

DATA_PATH = "/Users/nacho/Workspace/skills-marketplace/data/skills-data.json"
INDEX_PATH = "/Users/nacho/Workspace/skills-marketplace/data/skills-index.json"

with open(DATA_PATH) as f:
    data = json.load(f)

slug_index = {}       # slug -> position index
category_index = defaultdict(list)  # category -> [slugs]
tag_index = defaultdict(list)       # tag -> [slugs]
language_index = defaultdict(list)  # language -> [slugs]
tag_counts = defaultdict(int)

for i, skill in enumerate(data):
    slug = skill.get("slug") or skill.get("id")
    if not slug:
        continue

    slug_index[slug] = i

    category = skill.get("category")
    if category:
        category_index[category].append(slug)

    for tag in skill.get("tags", []):
        tag_index[tag].append(slug)
        tag_counts[tag] += 1

    lang = skill.get("language")
    if lang:
        language_index[lang].append(slug)

index = {
    "version": "1.0.0",
    "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    "slugIndex": slug_index,
    "categoryIndex": dict(category_index),
    "tagIndex": dict(tag_index),
    "languageIndex": dict(language_index),
    "aggregates": {
        "tagCounts": dict(tag_counts),
        "totalSkills": len(data),
        "totalTags": len(tag_index),
        "totalCategories": len(category_index),
    },
}

with open(INDEX_PATH, "w") as f:
    json.dump(index, f, indent=2, ensure_ascii=False)

print(f"Rebuilt index:")
print(f"  Skills: {len(data)}")
print(f"  Slugs indexed: {len(slug_index)}")
print(f"  Categories: {len(category_index)}")
print(f"  Tags: {len(tag_index)}")
print(f"  Languages: {len(language_index)}")

# Check untagged skills remaining
untagged = [s for s in data if not s.get("tags") or len(s["tags"]) == 0]
print(f"  Untagged skills remaining: {len(untagged)}")
