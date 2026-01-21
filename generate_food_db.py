#!/usr/bin/env python3
"""
Quick food database generator from CSV files
Creates foodDatabase.json for use in the LOAF app
"""

import csv
import json
import os
from typing import Dict, List, Any

def parse_nutrition_from_ifct(row: Dict[str, Any]) -> Dict[str, Any]:
    """Parse nutrition data from IFCT2017 CSV"""
    nutrition = {
        "calories": 0.0,
        "protein": 0.0,
        "carbs": 0.0,
        "fat": 0.0,
        "fiber": 0.0
    }
    try:
        if "Calories (kcal)" in row and row["Calories (kcal)"]:
            nutrition["calories"] = round(float(row["Calories (kcal)"]), 1)
        if "Proteins" in row and row["Proteins"]:
            nutrition["protein"] = round(float(row["Proteins"]), 1)
        if "Carbohydrates" in row and row["Carbohydrates"]:
            nutrition["carbs"] = round(float(row["Carbohydrates"]), 1)
        if "Fats" in row and row["Fats"]:
            nutrition["fat"] = round(float(row["Fats"]), 1)
        if "Fibre" in row and row["Fibre"]:
            nutrition["fiber"] = round(float(row["Fibre"]), 1)
        if "Iron (mg)" in row and row["Iron (mg)"]:
            nutrition["iron"] = round(float(row["Iron (mg)"]), 2)
        if "Calcium (mg)" in row and row["Calcium (mg)"]:
            nutrition["calcium"] = round(float(row["Calcium (mg)"]), 1)
    except (ValueError, TypeError):
        pass
    return nutrition

def parse_nutrition_from_healthy(row: Dict[str, Any]) -> Dict[str, Any]:
    """Parse nutrition data from Healthy Eating Dataset CSV"""
    nutrition = {
        "calories": 0.0,
        "protein": 0.0,
        "carbs": 0.0,
        "fat": 0.0,
        "fiber": 0.0
    }
    try:
        if "calories" in row and row["calories"]:
            nutrition["calories"] = round(float(row["calories"]), 1)
        if "protein_g" in row and row["protein_g"]:
            nutrition["protein"] = round(float(row["protein_g"]), 1)
        if "carbs_g" in row and row["carbs_g"]:
            nutrition["carbs"] = round(float(row["carbs_g"]), 1)
        if "fat_g" in row and row["fat_g"]:
            nutrition["fat"] = round(float(row["fat_g"]), 1)
        if "fiber_g" in row and row["fiber_g"]:
            nutrition["fiber"] = round(float(row["fiber_g"]), 1)
    except (ValueError, TypeError):
        pass
    return nutrition

def load_foods_from_ifct(csv_path: str) -> List[Dict[str, Any]]:
    """Load foods from IFCT2017.csv"""
    foods = []
    counter = 0
    processed_names = set()
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    if "Dish Name" not in row or not row["Dish Name"]:
                        continue
                    
                    dish_name = row["Dish Name"].strip()
                    if dish_name.lower() in processed_names:
                        continue
                    
                    processed_names.add(dish_name.lower())
                    
                    nutrition = parse_nutrition_from_ifct(row)
                    
                    # Skip if no calories
                    if "calories" not in nutrition:
                        continue
                    
                    food = {
                        "id": f"food_{counter:04d}",
                        "name": dish_name,
                        "category": "Indian Food",
                        "aliases": [dish_name.lower()],
                        "portionHints": {
                            "1x": 1.0,
                            "0.5x": 0.5,
                            "2x": 2.0
                        },
                        "nutrition": nutrition,
                        "confidence": 0.95,
                        "source": "IFCT2017",
                        "lastVerified": "2026-01-15"
                    }
                    
                    foods.append(food)
                    counter += 1
                    
                    if counter % 200 == 0:
                        print(f"  ✓ Processed {counter} foods from IFCT...")
                
                except Exception as e:
                    continue
        
        print(f"  ✅ Loaded {len(foods)} foods from IFCT2017")
    except Exception as e:
        print(f"  ❌ Error reading IFCT file: {e}")
    
    return foods

def load_foods_from_healthy(csv_path: str, existing_names: set) -> List[Dict[str, Any]]:
    """Load foods from healthy_eating_dataset.csv"""
    foods = []
    counter = 0
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    food_names = [
                        row.get("meal_name"),
                        row.get("Food_items"),
                        row.get("food_name")
                    ]
                    
                    food_name = next((n for n in food_names if n), None)
                    if not food_name:
                        continue
                    
                    food_name = food_name.strip()
                    if food_name.lower() in existing_names:
                        continue
                    
                    existing_names.add(food_name.lower())
                    
                    nutrition = parse_nutrition_from_healthy(row)
                    
                    # Skip if no calories
                    if "calories" not in nutrition:
                        continue
                    
                    food = {
                        "id": f"food_{4000 + counter:04d}",
                        "name": food_name,
                        "category": "Healthy",
                        "aliases": [food_name.lower()],
                        "portionHints": {
                            "1x": 1.0,
                            "0.5x": 0.5,
                            "2x": 2.0
                        },
                        "nutrition": nutrition,
                        "confidence": 0.88,
                        "source": "Healthy Eating Dataset",
                        "lastVerified": "2026-01-15"
                    }
                    
                    foods.append(food)
                    counter += 1
                    
                    if counter % 200 == 0:
                        print(f"  ✓ Processed {counter} additional foods...")
                
                except Exception as e:
                    continue
        
        print(f"  ✅ Loaded {len(foods)} additional foods from Healthy Eating Dataset")
    except Exception as e:
        print(f"  ❌ Error reading Healthy Eating file: {e}")
    
    return foods

def main():
    """Generate foodDatabase.json"""
    print("\n" + "="*60)
    print("🍽️  FOOD DATABASE GENERATOR")
    print("="*60)
    
    data_dir = "/home/franz/Documents/LOAF/Data"
    output_path = "/home/franz/Documents/LOAF/LOAF/data/foodDatabase.json"
    
    # Create output directory if needed
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    all_foods = []
    processed_names = set()
    
    # Load from IFCT2017
    print("\n📥 Loading from IFCT2017 CSV...")
    ifct_path = os.path.join(data_dir, "Indian_Food_Nutrition_Processed.csv")
    if os.path.exists(ifct_path):
        foods = load_foods_from_ifct(ifct_path)
        all_foods.extend(foods)
        processed_names.update(f["name"].lower() for f in foods)
    else:
        print(f"  ⚠️  File not found: {ifct_path}")
    
    # Load from Healthy Eating Dataset
    print("\n📥 Loading from Healthy Eating Dataset CSV...")
    healthy_path = os.path.join(data_dir, "healthy_eating_dataset.csv")
    if os.path.exists(healthy_path):
        foods = load_foods_from_healthy(healthy_path, processed_names)
        all_foods.extend(foods)
    else:
        print(f"  ⚠️  File not found: {healthy_path}")
    
    # Create database structure
    database = {
        "version": "1.0",
        "lastUpdated": "2026-01-17",
        "totalFoods": len(all_foods),
        "foods": all_foods
    }
    
    # Write to file
    print(f"\n💾 Writing {len(all_foods)} foods to {output_path}...")
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(database, f, indent=2, ensure_ascii=False)
        print(f"  ✅ Successfully created foodDatabase.json")
        print(f"\n📊 Summary:")
        print(f"  Total foods: {len(all_foods)}")
        print(f"  File size: {os.path.getsize(output_path) / 1024:.1f} KB")
    except Exception as e:
        print(f"  ❌ Error writing file: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    print("\n" + "="*60)
    if success:
        print("✅ Food database generation complete!")
    else:
        print("❌ Food database generation failed!")
    print("="*60 + "\n")
