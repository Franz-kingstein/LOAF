#!/usr/bin/env python3
"""
Food Database Migration Script
Migrates CSV food data into the JSON foodDatabase format
Handles 300+ foods with all required fields
"""

import json
import csv
import os
from pathlib import Path
from typing import Dict, List, Any

class FoodDatabaseMigrator:
    def __init__(self):
        self.food_counter = 4  # Starting from food_004 (first 3 already exist)
        self.processed_foods = set()  # Track duplicate foods
        self.aliases_map = self._build_aliases_map()
        self.portion_defaults = {
            "beverages": {"1_cup": 240, "1_glass": 200, "half_cup": 120},
            "breakfast": {"1_serving": 100, "1_plate": 150, "half_plate": 75},
            "lunch": {"1_serving": 150, "1_plate": 200, "half_plate": 100},
            "dinner": {"1_serving": 150, "1_plate": 200, "half_plate": 100},
            "snacks": {"1_piece": 50, "1_serving": 75, "handful": 30},
            "desserts": {"1_piece": 50, "1_serving": 100, "1_spoon": 15},
            "fruits": {"1_medium": 150, "1_small": 100, "1_cup": 150},
            "vegetables": {"1_cup": 100, "1_serving": 150, "handful": 75},
            "dairy": {"1_cup": 240, "1_glass": 200, "half_cup": 120},
            "grains": {"1_cup": 200, "1_serving": 100, "handful": 50},
        }
        self.category_keywords = self._build_category_keywords()
        
    def _build_aliases_map(self) -> Dict[str, List[str]]:
        """Build a map of food names to their common aliases in Indian context"""
        return {
            "chai": ["garam chai", "hot tea", "chai", "tea", "indian tea", "masala chai"],
            "coffee": ["instant coffee", "coffee", "nescafe", "black coffee", "coffee powder"],
            "rice": ["rice", "chawal", "white rice", "cooked rice", "boiled rice"],
            "dal": ["dal", "lentil", "moong dal", "arhar dal", "masoor dal", "chana dal"],
            "roti": ["roti", "chapati", "bread", "wheat roti", "phulka"],
            "dosa": ["dosa", "masala dosa", "plain dosa", "crispy dosa"],
            "idli": ["idli", "steamed idli", "soft idli"],
            "paneer": ["paneer", "cottage cheese", "panir", "cheese"],
            "milk": ["milk", "cow milk", "doodh", "plain milk"],
            "lassi": ["lassi", "yogurt drink", "sweet lassi", "salted lassi"],
            "samosa": ["samosa", "fried samosa", "vegetable samosa"],
            "pakora": ["pakora", "fritter", "vegetable pakora", "onion pakora"],
            "curry": ["curry", "sabzi", "vegetable curry", "gravy"],
            "khichdi": ["khichdi", "khichuri", "rice lentil"],
            "biryani": ["biryani", "dum biryani", "chicken biryani", "vegetable biryani"],
            "pulao": ["pulao", "pilau", "rice pulao", "vegetable pulao"],
            "pickle": ["pickle", "achar", "mango pickle", "lime pickle"],
            "bhaji": ["bhaji", "sabzi", "potato bhaji", "vegetable bhaji"],
            "chutney": ["chutney", "sauce", "green chutney", "mint chutney"],
            "soup": ["soup", "shorba", "vegetable soup", "lentil soup"],
            "salad": ["salad", "fresh salad", "mixed salad", "vegetable salad"],
            "juice": ["juice", "fresh juice", "orange juice", "mango juice"],
        }
        
    def _build_category_keywords(self) -> Dict[str, List[str]]:
        """Build category detection keywords"""
        return {
            "beverages": ["tea", "coffee", "juice", "milk", "lassi", "shake", "drink", "smoothie", "cola", "water", "cooler"],
            "breakfast": ["breakfast", "porridge", "cereal", "oatmeal", "toast", "eggs", "pancake", "waffle", "paratha"],
            "fruits": ["apple", "banana", "mango", "orange", "grape", "papaya", "watermelon", "pineapple", "guava", "berry"],
            "vegetables": ["carrot", "potato", "onion", "tomato", "cabbage", "spinach", "broccoli", "cauliflower", "bean", "pea"],
            "dairy": ["cheese", "paneer", "yogurt", "curd", "milk", "ghee", "butter", "cream"],
            "grains": ["rice", "wheat", "bread", "roti", "chapati", "cereal", "oats", "grain", "flour"],
            "snacks": ["samosa", "pakora", "chips", "snack", "fried", "crisp", "popcorn", "biscuit", "cookie"],
            "desserts": ["dessert", "sweet", "cake", "pie", "pudding", "candy", "chocolate", "ice cream", "pastry"],
            "lunch": ["lunch", "curry", "dal", "sabzi", "biryani", "pulao", "khichdi"],
            "dinner": ["dinner", "curry", "dal", "sabzi", "biryani", "pulao", "khichdi"],
        }

    def detect_category(self, food_name: str) -> str:
        """Detect category based on food name"""
        food_lower = food_name.lower()
        
        # Check keywords
        for category, keywords in self.category_keywords.items():
            for keyword in keywords:
                if keyword in food_lower:
                    return category
        
        # Default based on common patterns
        if any(x in food_lower for x in ["curry", "dal", "sabzi", "biryani", "khichdi"]):
            return "lunch"
        if any(x in food_lower for x in ["sandwich", "toast", "porridge"]):
            return "breakfast"
        
        return "snacks"  # Default

    def detect_diet_type(self, food_name: str) -> str:
        """Detect diet type (vegan, vegetarian, etc.)"""
        food_lower = food_name.lower()
        
        if any(x in food_lower for x in ["chicken", "meat", "fish", "egg", "mutton"]):
            return "non-vegetarian"
        if any(x in food_lower for x in ["vegan", "tofu", "vegetable"]):
            return "vegan"
        
        return "vegetarian"

    def generate_aliases(self, food_name: str) -> List[str]:
        """Generate aliases for a food item"""
        aliases = [food_name.lower()]
        
        # Add common variations
        name_parts = food_name.lower().split()
        
        # Add individual word aliases
        for part in name_parts:
            if len(part) > 2 and part not in aliases:
                aliases.append(part)
        
        # Add without brackets
        if "(" in food_name:
            clean_name = food_name.split("(")[0].strip().lower()
            if clean_name not in aliases:
                aliases.append(clean_name)
        
        # Add abbreviations if applicable
        if " and " in food_name.lower():
            variants = food_name.lower().replace(" and ", " & ")
            if variants not in aliases:
                aliases.append(variants)
        
        return aliases[:6]  # Limit to 6 aliases

    def get_portion_hints(self, category: str) -> Dict[str, float]:
        """Get portion hints based on category"""
        return self.portion_defaults.get(category, self.portion_defaults["snacks"])

    def calculate_confidence(self, source: str, has_all_nutrition: bool = True) -> float:
        """Calculate confidence score based on data source and completeness"""
        base_score = 0.85
        
        if source == "IFCT2017":
            base_score = 0.95
        elif source == "Healthy Eating Dataset":
            base_score = 0.88
        elif source == "RDA System":
            base_score = 0.82
        
        if not has_all_nutrition:
            base_score -= 0.1
        
        return min(base_score, 0.99)

    def parse_nutrition(self, row: Dict[str, Any], source: str) -> Dict[str, Any]:
        """Parse nutrition data based on source format"""
        nutrition = {}
        
        # Common fields across sources
        fields_map = {
            "calories": ["Calories (kcal)", "calories", "Calories"],
            "carbohydrates": ["Carbohydrates (g)", "carbs_g", "Carbohydrates"],
            "protein": ["Protein (g)", "protein_g", "Proteins"],
            "fat": ["Fats (g)", "fat_g", "Fats"],
            "fiber": ["Fibre (g)", "fiber_g", "Fibre"],
            "sugar": ["Free Sugar (g)", "sugar_g", "Sugars"],
            "sodium": ["Sodium (mg)", "sodium_mg", "Sodium"],
            "calcium": ["Calcium (mg)", None, "Calcium"],
            "iron": ["Iron (mg)", None, "Iron"],
            "vitaminC": ["Vitamin C (mg)", None, "Vitamin C"],
            "folate": ["Folate (µg)", None, "Folate"],
        }
        
        # Extract nutrition values
        try:
            for nutrient, possible_keys in fields_map.items():
                value = None
                for key in possible_keys:
                    if key and key in row:
                        try:
                            value = float(row[key]) if row[key] else 0
                            break
                        except (ValueError, TypeError):
                            continue
                
                if value is not None:
                    if nutrient in ["carbohydrates", "protein", "fat", "fiber", "sugar", "sodium", "calcium", "iron", "vitaminC"]:
                        if nutrient == "sodium":
                            nutrition[nutrient] = {"value": round(value, 2), "unit": "mg"}
                        elif nutrient == "calcium":
                            nutrition[nutrient] = {"value": round(value, 2), "unit": "mg"}
                        elif nutrient == "iron":
                            nutrition[nutrient] = {"value": round(value, 2), "unit": "mg"}
                        elif nutrient == "vitaminC":
                            nutrition[nutrient] = {"value": round(value, 2), "unit": "mg"}
                        elif nutrient in ["carbohydrates", "protein", "fat", "fiber", "sugar"]:
                            nutrition[nutrient] = {"value": round(value, 2), "unit": "g"}
                    elif nutrient == "folate":
                        nutrition[nutrient] = {"value": round(value, 2), "unit": "µg"}
                    elif nutrient == "calories":
                        nutrition[nutrient] = round(value, 2)
        except Exception as e:
            print(f"Warning: Error parsing nutrition for {row.get('Dish Name', 'Unknown')}: {str(e)}")
        
        return nutrition

    def create_food_entry(self, row: Dict[str, Any], source: str) -> Dict[str, Any]:
        """Create a food entry from a CSV row"""
        
        # Determine food name
        if "Dish Name" in row:
            food_name = row["Dish Name"].strip()
        elif "meal_name" in row:
            food_name = row["meal_name"].strip()
        elif "Food_items" in row:
            food_name = row["Food_items"].strip()
        else:
            return None
        
        # Check for duplicates (case-insensitive)
        food_key = food_name.lower()
        if food_key in self.processed_foods:
            return None
        
        self.processed_foods.add(food_key)
        
        # Create food entry
        category = self.detect_category(food_name)
        diet_type = self.detect_diet_type(food_name)
        
        food_entry = {
            "id": f"food_{self.food_counter:04d}",
            "name": food_name,
            "aliases": self.generate_aliases(food_name),
            "category": category,
            "cuisine": row.get("cuisine", "Indian"),
            "servingSize": 100,
            "servingSizeUnit": "g" if "g" not in row.get("serving_size_g", "") else "g",
            "portionHints": self.get_portion_hints(category),
            "nutrition": self.parse_nutrition(row, source),
            "isHealthy": str(row.get("is_healthy", "1")) != "0",
            "vegetarian": diet_type in ["vegetarian", "vegan"],
            "vegan": diet_type == "vegan",
            "glutenFree": True,  # Default to True, can be refined
            "allergens": [],
            "prepTime": int(row.get("prep_time_min", 5)) if row.get("prep_time_min") else 5,
            "cookTime": int(row.get("cook_time_min", 5)) if row.get("cook_time_min") else 5,
            "confidence": self.calculate_confidence(source, len(self.parse_nutrition(row, source)) > 3),
            "source": source,
            "lastVerified": "2026-01-15"
        }
        
        self.food_counter += 1
        return food_entry

    def migrate_from_csv(self, csv_path: str, source: str) -> List[Dict[str, Any]]:
        """Migrate foods from CSV file"""
        foods = []
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    try:
                        food_entry = self.create_food_entry(row, source)
                        if food_entry:
                            foods.append(food_entry)
                            if len(foods) % 100 == 0:
                                print(f"  Processed {len(foods)} foods from {source}...")
                    except Exception as e:
                        print(f"  Warning: Error processing row from {source}: {str(e)}")
                        continue
        except Exception as e:
            print(f"Error reading {csv_path}: {str(e)}")
        
        return foods

    def migrate_all(self, data_dir: str) -> List[Dict[str, Any]]:
        """Migrate all foods from all CSV files"""
        all_foods = []
        
        # CSV files in priority order
        csv_files = [
            ("Indian_Food_Nutrition_Processed.csv", "IFCT2017"),
            ("healthy_eating_dataset.csv", "Healthy Eating Dataset"),
            ("indian_rda_based_diet_recommendation_system.csv", "RDA System"),
        ]
        
        for csv_file, source in csv_files:
            csv_path = os.path.join(data_dir, csv_file)
            if os.path.exists(csv_path):
                print(f"\n📥 Migrating from {csv_file} ({source})...")
                foods = self.migrate_from_csv(csv_path, source)
                print(f"   ✅ Added {len(foods)} foods from {source}")
                all_foods.extend(foods)
            else:
                print(f"⚠️  File not found: {csv_path}")
        
        return all_foods

    def merge_with_existing(self, existing_foods: List[Dict[str, Any]], new_foods: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Merge new foods with existing foods, avoiding duplicates"""
        existing_names = {f["name"].lower() for f in existing_foods}
        
        merged = existing_foods.copy()
        duplicates_skipped = 0
        
        for new_food in new_foods:
            if new_food["name"].lower() not in existing_names:
                merged.append(new_food)
            else:
                duplicates_skipped += 1
        
        if duplicates_skipped > 0:
            print(f"⚠️  Skipped {duplicates_skipped} duplicate food entries")
        
        return merged


def main():
    """Main migration script"""
    print("\n" + "="*80)
    print("🚀 FOOD DATABASE MIGRATION - STARTING")
    print("="*80)
    
    # Paths
    data_dir = "/home/franz/Documents/LOAF/Data"
    db_path = "/home/franz/Documents/LOAF/LOAF/data/foodDatabase.json"
    
    # Load existing database
    print("\n📂 Loading existing database...")
    try:
        with open(db_path, 'r', encoding='utf-8') as f:
            existing_db = json.load(f)
        existing_foods = existing_db["foodDatabase"]["foods"]
        print(f"   ✅ Loaded {len(existing_foods)} existing foods")
    except Exception as e:
        print(f"   ⚠️  Could not load existing database: {str(e)}")
        existing_foods = []
    
    # Migrate from CSVs
    print("\n🔄 Starting migration from CSV files...")
    migrator = FoodDatabaseMigrator()
    new_foods = migrator.migrate_all(data_dir)
    
    print(f"\n📊 Migration Summary:")
    print(f"   Total new foods migrated: {len(new_foods)}")
    print(f"   Existing foods: {len(existing_foods)}")
    
    # Merge
    print("\n🔗 Merging with existing foods...")
    all_foods = migrator.merge_with_existing(existing_foods, new_foods)
    
    # Update database
    print("\n💾 Updating database structure...")
    existing_db["foodDatabase"]["foods"] = all_foods
    existing_db["foodDatabase"]["totalFoods"] = len(all_foods)
    existing_db["foodDatabase"]["lastUpdated"] = "2026-01-15"
    
    # Save to file
    print(f"\n💾 Saving to {db_path}...")
    try:
        with open(db_path, 'w', encoding='utf-8') as f:
            json.dump(existing_db, f, ensure_ascii=False, indent=2)
        print(f"   ✅ Database saved successfully!")
    except Exception as e:
        print(f"   ❌ Error saving database: {str(e)}")
        return False
    
    # Final statistics
    print("\n" + "="*80)
    print("✅ MIGRATION COMPLETE")
    print("="*80)
    print(f"\n📊 FINAL STATISTICS:")
    print(f"   Total foods in database: {len(all_foods)}")
    print(f"   Original foods: 3")
    print(f"   Migrated foods: {len(new_foods)}")
    print(f"   Total unique foods: {len(all_foods)}")
    print(f"\n   Database size: {os.path.getsize(db_path) / 1024:.1f} KB")
    print(f"   File location: {db_path}")
    
    # Show some statistics
    categories = {}
    sources = {}
    confidence_avg = 0
    
    for food in all_foods:
        cat = food.get("category", "unknown")
        categories[cat] = categories.get(cat, 0) + 1
        
        src = food.get("source", "unknown")
        sources[src] = sources.get(src, 0) + 1
        
        confidence_avg += food.get("confidence", 0)
    
    confidence_avg /= len(all_foods)
    
    print(f"\n📈 BREAKDOWN BY CATEGORY:")
    for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        print(f"   {cat}: {count}")
    
    print(f"\n📊 BREAKDOWN BY SOURCE:")
    for src, count in sorted(sources.items(), key=lambda x: x[1], reverse=True):
        print(f"   {src}: {count}")
    
    print(f"\n⭐ AVERAGE CONFIDENCE: {confidence_avg:.2f}")
    print("\n✨ Database ready for use in the Expo app!")
    print("="*80 + "\n")
    
    return True


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
