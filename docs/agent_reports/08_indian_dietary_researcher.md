# Indian Dietary Facts Dataset & Calorie Tracker Specifications
*Prepared by Indian Dietary Research Subagent for Health Planner Architecture*

---

## Executive Summary
This document provides complete research specifications, dataset schema design, regional food taxonomy, standard serving unit conversion rules, and a custom home-cooked calorie estimation algorithm tailored for the Indian context based on the **ICMR-NIN Indian Food Composition Tables (IFCT 2017)** and **Indian Nutrient Databank (INDB)**.

---

## 1. Indian Food Composition Dataset Structure (ICMR-NIN IFCT Standard)

### 1.1 Standard Foundations
The **ICMR-NIN IFCT 2017** provides reference values for raw foodstuffs across 18 food groups with 151 nutrient parameters. To convert raw laboratory data into a production-grade Calorie Tracker database, the schema bridges **Raw IFCT Ingredient Profiles** with **Cooked Recipe Datasets (INDB)**.

### 1.2 Core Data Architecture & Relational Entities

```
+-------------------------------------------------------+
|                       FoodItem                        |
+-------------------------------------------------------+
| id: UUID                                              |
| ifct_code: String (e.g., "A001")                      |
| name_en: String ("Toor Dal / Pigeon Pea")             |
| name_regional: Map<Locale, String>                    |
| category: Enum (Cereals, Pulses, Dairy, Sweets, etc.) |
| regional_tag: Enum (NORTH, SOUTH, EAST, WEST, PAN)    |
| dietary_tag: Enum (VEG, VEGAN, NON_VEG, EGG, JAIN)   |
| state: Enum (RAW, COOKED, PREPARED_RECIPE)            |
| default_serving_unit_id: UUID                         |
+-------------------------------------------------------+
                           | 1
                           |
            +--------------+--------------+
            | 1:N                         | 1:N
+-----------------------+     +-----------------------+
|     ServingUnit       |     |    NutrientProfile    |
+-----------------------+     +-----------------------+
| id: UUID              |     | food_item_id: UUID    |
| food_item_id: UUID    |     | energy_kcal: Float    |
| unit_name: String     |     | carbohydrates_g: Float|
| gram_equivalent: Float|     | protein_g: Float      |
| description: String   |     | fat_total_g: Float    |
| is_default: Boolean   |     | fiber_g: Float        |
+-----------------------+     | saturated_fat_g: Float|
                              | mufa_g: Float         |
                              | pufa_g: Float         |
                              | trans_fat_g: Float    |
                              | sodium_mg: Float      |
                              | potassium_mg: Float   |
                              | calcium_mg: Float     |
                              | iron_mg: Float        |
                              | glycemic_index: Int   |
                              | gi_category: Enum     |
                              +-----------------------+
```

---

## 2. Regional Food Taxonomy & Nutritional Profile

### 2.1 North Indian Regional Foods
* **Roti / Chapati (Whole Wheat)**
  * *Serving*: 1 medium (30g cooked wt / ~20g raw dry flour)
  * *Macros*: 80 kcal | 15.0g Carbs | 3.0g Protein | 0.5g Fat | 2.5g Fiber
  * *Glycemic Index*: 52 (Low GI) | *Tag*: Vegan / Veg
* **Dal Tadka (Yellow Toor Dal cooked with Ghee/Oil Tadka)**
  * *Serving*: 1 Katori (150g cooked)
  * *Macros*: 150 kcal | 18.0g Carbs | 7.0g Protein | 5.0g Fat | 4.5g Fiber
  * *Glycemic Index*: 35 (Low GI) | *Tag*: Vegetarian (Vegan if oil tadka)
* **Paneer Butter Masala**
  * *Serving*: 1 Katori (150g cooked gravy + paneer)
  * *Macros*: 280 kcal | 8.0g Carbs | 11.0g Protein | 22.0g Fat | 2.0g Fiber
  * *Glycemic Index*: 58 (Medium GI) | *Tag*: Vegetarian
* **Chole (Punjabi Chickpea Curry)**
  * *Serving*: 1 Katori (150g cooked)
  * *Macros*: 210 kcal | 26.0g Carbs | 8.0g Protein | 8.0g Fat | 6.0g Fiber
  * *Glycemic Index*: 38 (Low GI) | *Tag*: Vegan
* **Rajma Masala (Kidney Bean Gravy)**
  * *Serving*: 1 Katori (150g cooked)
  * *Macros*: 195 kcal | 24.0g Carbs | 8.0g Protein | 7.0g Fat | 5.5g Fiber
  * *Glycemic Index*: 34 (Low GI) | *Tag*: Vegan

### 2.2 South Indian Regional Foods
* **Steamed Idli**
  * *Serving*: 1 piece (40g cooked)
  * *Macros*: 55 kcal | 12.0g Carbs | 1.8g Protein | 0.2g Fat | 0.8g Fiber
  * *Glycemic Index*: 60 (Medium GI) | *Tag*: Vegan
* **Plain Dosa**
  * *Serving*: 1 medium Dosa (80g cooked)
  * *Macros*: 165 kcal | 28.0g Carbs | 3.5g Protein | 4.5g Fat | 1.5g Fiber
  * *Glycemic Index*: 64 (Medium GI) | *Tag*: Vegan
* **South Indian Sambar**
  * *Serving*: 1 Katori (150g cooked)
  * *Macros*: 110 kcal | 14.0g Carbs | 4.5g Protein | 4.0g Fat | 3.5g Fiber
  * *Glycemic Index*: 42 (Low GI) | *Tag*: Vegan
* **Rava Upma**
  * *Serving*: 1 Katori / Bowl (150g cooked)
  * *Macros*: 210 kcal | 32.0g Carbs | 5.0g Protein | 7.0g Fat | 2.5g Fiber
  * *Glycemic Index*: 65 (Medium GI) | *Tag*: Vegan
* **Curd Rice (Thayir Sadam)**
  * *Serving*: 1 Katori (180g cooked)
  * *Macros*: 220 kcal | 32.0g Carbs | 5.5g Protein | 8.0g Fat | 1.0g Fiber
  * *Glycemic Index*: 55 (Low GI) | *Tag*: Vegetarian

### 2.3 East Indian Regional Foods
* **Machher Jhol (Bengali Fish Curry)**
  * *Serving*: 1 piece fish + gravy (180g)
  * *Macros*: 210 kcal | 4.0g Carbs | 22.0g Protein | 12.0g Fat | 1.0g Fiber
  * *Glycemic Index*: < 30 (Low GI) | *Tag*: Non-Vegetarian
* **Steamed Rice (White Rice cooked)**
  * *Serving*: 1 Katori (150g cooked wt)
  * *Macros*: 190 kcal | 41.0g Carbs | 3.5g Protein | 0.5g Fat | 1.0g Fiber
  * *Glycemic Index*: 73 (High GI) | *Tag*: Vegan
* **Pakhala Bhata (Odia Fermented Rice with curd & cumin)**
  * *Serving*: 1 Bowl (250g fermented mix)
  * *Macros*: 160 kcal | 32.0g Carbs | 3.0g Protein | 0.5g Fat | 1.5g Fiber
  * *Glycemic Index*: 52 (Low GI) | *Tag*: Vegetarian
* **Mishti Doi**
  * *Serving*: 1 Small Katori (100g)
  * *Macros*: 180 kcal | 24.0g Carbs | 4.0g Protein | 7.5g Fat | 0g Fiber
  * *Glycemic Index*: 58 (Medium GI) | *Tag*: Vegetarian

### 2.4 West Indian Regional Foods
* **Kanda Poha**
  * *Serving*: 1 Katori / Plate (150g)
  * *Macros*: 220 kcal | 36.0g Carbs | 4.0g Protein | 7.0g Fat | 3.0g Fiber
  * *Glycemic Index*: 62 (Medium GI) | *Tag*: Vegan
* **Pav Bhaji**
  * *Serving*: 1 Plate (150g Bhaji + 2 Buttered Pavs = 250g)
  * *Macros*: 420 kcal | 62.0g Carbs | 9.0g Protein | 15.0g Fat | 6.0g Fiber
  * *Glycemic Index*: 72 (High GI) | *Tag*: Vegetarian
* **Khaman Dhokla**
  * *Serving*: 1 Piece (40g)
  * *Macros*: 60 kcal | 9.0g Carbs | 2.5g Protein | 1.8g Fat | 1.0g Fiber
  * *Glycemic Index*: 48 (Low GI) | *Tag*: Vegan
* **Methi Thepla**
  * *Serving*: 1 Piece (35g)
  * *Macros*: 110 kcal | 16.0g Carbs | 3.0g Protein | 4.0g Fat | 2.0g Fiber
  * *Glycemic Index*: 50 (Low GI) | *Tag*: Vegetarian / Vegan
* **Thalipeeth (Multigrain Flatbread)**
  * *Serving*: 1 Piece (60g)
  * *Macros*: 160 kcal | 24.0g Carbs | 4.5g Protein | 5.5g Fat | 3.5g Fiber
  * *Glycemic Index*: 45 (Low GI) | *Tag*: Vegetarian

### 2.5 Snacks & Street Food
* **Samosa (Potato Filled)**
  * *Serving*: 1 Piece (80g)
  * *Macros*: 260 kcal | 30.0g Carbs | 4.0g Protein | 14.0g Fat | 2.5g Fiber
  * *Glycemic Index*: 70 (High GI) | *Tag*: Vegan
* **Pani Puri / Golgappa**
  * *Serving*: 1 Plate (6 Puris with spicy & sweet water)
  * *Macros*: 180 kcal | 28.0g Carbs | 3.0g Protein | 7.0g Fat | 2.0g Fiber
  * *Glycemic Index*: 68 (Medium GI) | *Tag*: Vegan
* **Steamed Veg Momos**
  * *Serving*: 6 Pieces (120g)
  * *Macros*: 210 kcal | 36.0g Carbs | 5.0g Protein | 5.0g Fat | 2.0g Fiber
  * *Glycemic Index*: 62 (Medium GI) | *Tag*: Vegan

### 2.6 Indian Sweets & Desserts
* **Gulab Jamun**
  * *Serving*: 1 Piece with syrup (50g)
  * *Macros*: 175 kcal | 26.0g Carbs | 2.5g Protein | 7.0g Fat | 0.3g Fiber
  * *Glycemic Index*: 78 (High GI) | *Tag*: Vegetarian
* **Rice Kheer**
  * *Serving*: 1 Katori (150g)
  * *Macros*: 230 kcal | 34.0g Carbs | 5.5g Protein | 8.0g Fat | 0.5g Fiber
  * *Glycemic Index*: 66 (Medium GI) | *Tag*: Vegetarian
* **Besan Ladoo**
  * *Serving*: 1 Piece (35g)
  * *Macros*: 170 kcal | 19.0g Carbs | 3.0g Protein | 9.5g Fat | 1.5g Fiber
  * *Glycemic Index*: 60 (Medium GI) | *Tag*: Vegetarian

---

## 3. Serving Size Conversions & Household Measures Matrix

To eliminate confusion between raw dry weight and cooked Indian household utensils, the app standardizes the following unit mapping:

| Household Unit | Gram / Volume Equivalent | Common Context / Dishes | Notes / Conversion Rules |
| :--- | :--- | :--- | :--- |
| **1 Small Katori** | 100g / 100ml | Dal, Sabzi, Chutney | Standard Indian dessert/side bowl |
| **1 Standard Katori** | 150g / 150ml | Gravy Sabzi, Dal, Sambar, Curd, Rice | Standard baseline unit for curries |
| **1 Large Katori / Bowl** | 220g / 220ml | Biryani, Khichdi, Pakhala | Meal portion size |
| **1 Medium Roti / Chapati** | 30g cooked wt | Whole Wheat Roti | Made from 20g dry wheat flour (Atta) |
| **1 Phulka (No Oil)** | 25g cooked wt | Oil-free Roti | Made from 17g dry wheat flour |
| **1 Paratha (Plain)** | 60g cooked wt | Stuffed/Plain Paratha | Includes ~1 tsp ghee/oil added during pan-frying |
| **1 tbsp Ghee / Oil** | 15g / 15ml | Tadka, Pan-frying | **120 kcal** pure fat addition |
| **1 tsp Ghee / Oil** | 5g / 5ml | Topping on Roti/Dal | **40 kcal** pure fat addition |
| **1 Piece** | Variable (35g - 80g) | Idli (40g), Samosa (80g), Dhokla (40g) | Item-specific standard weights |
| **1 Plate** | 250g - 350g | Pav Bhaji, Chole Bhature, Poha Plate | Full single-serving meal combo |
| **1 Glass** | 200ml - 250ml | Chaas, Lassi, Milk, Juice | Standard beverage mug/glass |
| **Gram Entry** | 1g exact | Custom tracking | User enters exact weight from scale |

---

## 4. Custom Home-Cooked Indian Calorie Estimation Algorithm

### 4.1 The Challenge of Indian Home Cooking
Indian home-cooked meals vary significantly based on:
1. **Water Absorption / Cooked Yield Factor** (e.g. 100g dry rice absorbs water to yield ~280g-300g cooked rice).
2. **Oil / Ghee Added in Tadka** (1 tbsp extra oil adds 120 kcal without altering dish volume significantly).
3. **Regional Recipe Variations** (e.g. South Indian Sambhar vs North Indian Dal Fry).

### 4.2 Mathematical Algorithm Framework

$$\text{Energy}_{\text{total}} = \sum \left( \text{Weight}_{\text{raw}, i} \times \text{Density}_{\text{energy}, i} \right) + \left( \text{Volume}_{\text{oil\_tbsp}} \times 120 \right) + \left( \text{Weight}_{\text{ghee\_tbsp}} \times 120 \right)$$

#### Step 1: Raw-to-Cooked Yield Factor Calculation
To convert tracked cooked weight back to nutrient-dense raw ingredient equivalents:
$$\text{Raw Weight (g)} = \frac{\text{Cooked Portion Weight (g)}}{\text{Yield Factor (YF)}}$$

*Standard Yield Factors ($YF$):*
- **Boiled White Rice**: $YF = 2.80$
- **Dal (Toor/Moong/Chana cooked)**: $YF = 2.60$
- **Roti (Atta to Cooked Roti)**: $YF = 1.50$ (Atta gains ~50% weight in water during kneading)
- **Cooked Dry Sabzi (Vegetables)**: $YF = 0.85$ (Loss of moisture due to roasting/sauteing)
- **Meat / Chicken Curry**: $YF = 0.75$ (Shrinkage due to moisture release)

#### Step 2: Fat & Tadka Adjustment Engine
When logging a dish, the tracker prompts:
*Oil Intensity Level:*
- `LOW_OIL`: 0.5 tsp oil per serving (+20 kcal)
- `STANDARD_HOME`: 1 tsp oil/ghee per serving (+40 kcal)
- `RESTAURANT_STYLE`: 1 tbsp oil/ghee per serving (+120 kcal)

$$\text{Calories}_{\text{adjusted}} = \text{Calories}_{\text{base\_cooked}} + \Delta \text{Oil\_Kcal}$$

#### Step 3: Smart Search & Fuzzy Phonetic Matching
Indian food names vary by dialect. Search implements **Double Metaphone + Levenshtein Distance (Threshold 0.8)** across English and regional scripts:
- Alias Map: `{"Phulka", "Roti", "Chapati", "Fulka", "Wheat Flatbread"}` $\rightarrow$ **Roti**
- Alias Map: `{"Thayir Sadam", "Curd Rice", "Dahi Chawal", "Mosaranna"}` $\rightarrow$ **Curd Rice**

---

## 5. Production JSON Datasets & Database Schemas

### 5.1 JSON Schema Definition (`FoodItem`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "IndianFoodItem",
  "type": "object",
  "properties": {
    "food_id": { "type": "string" },
    "ifct_code": { "type": "string" },
    "name": {
      "english": { "type": "string" },
      "hindi": { "type": "string" },
      "regional_aliases": { "type": "array", "items": { "type": "string" } }
    },
    "category": { "type": "string" },
    "region": { "type": "string", "enum": ["NORTH", "SOUTH", "EAST", "WEST", "PAN_INDIAN"] },
    "dietary_type": { "type": "string", "enum": ["VEGETARIAN", "VEGAN", "NON_VEGETARIAN", "EGGETARIAN", "JAIN"] },
    "nutrients_per_100g": {
      "calories_kcal": { "type": "number" },
      "carbohydrates_g": { "type": "number" },
      "protein_g": { "type": "number" },
      "fat_g": { "type": "number" },
      "fiber_g": { "type": "number" },
      "sodium_mg": { "type": "number" },
      "potassium_mg": { "type": "number" },
      "calcium_mg": { "type": "number" },
      "iron_mg": { "type": "number" }
    },
    "glycemic_profile": {
      "index": { "type": "integer" },
      "category": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH"] }
    },
    "serving_units": {
      "type": "array",
      "items": {
        "unit_name": { "type": "string" },
        "gram_weight": { "type": "number" },
        "is_default": { "type": "boolean" }
      }
    }
  },
  "required": ["food_id", "name", "category", "dietary_type", "nutrients_per_100g", "serving_units"]
}
```

### 5.2 Sample Seed Dataset (JSON Output)
```json
[
  {
    "food_id": "IND_NORTH_001",
    "ifct_code": "A008_COOKED",
    "name": {
      "english": "Roti / Chapati",
      "hindi": "रोटी / चपाती",
      "regional_aliases": ["Phulka", "Fulka", "Wheat Flatbread"]
    },
    "category": "Cereals & Flatbreads",
    "region": "NORTH",
    "dietary_type": "VEGAN",
    "nutrients_per_100g": {
      "calories_kcal": 267.0,
      "carbohydrates_g": 50.0,
      "protein_g": 10.0,
      "fat_g": 1.67,
      "fiber_g": 8.33,
      "sodium_mg": 190.0,
      "potassium_mg": 290.0,
      "calcium_mg": 35.0,
      "iron_mg": 3.8
    },
    "glycemic_profile": {
      "index": 52,
      "category": "LOW"
    },
    "serving_units": [
      { "unit_name": "1 Medium Roti", "gram_weight": 30.0, "is_default": true },
      { "unit_name": "1 Large Roti", "gram_weight": 45.0, "is_default": false },
      { "unit_name": "1 Phulka (No Oil)", "gram_weight": 25.0, "is_default": false },
      { "unit_name": "Grams", "gram_weight": 1.0, "is_default": false }
    ]
  },
  {
    "food_id": "IND_NORTH_002",
    "ifct_code": "B003_COOKED",
    "name": {
      "english": "Dal Tadka",
      "hindi": "दाल तड़का",
      "regional_aliases": ["Yellow Dal", "Toor Dal Fry", "Arhar Dal"]
    },
    "category": "Pulses & Legumes",
    "region": "NORTH",
    "dietary_type": "VEGETARIAN",
    "nutrients_per_100g": {
      "calories_kcal": 100.0,
      "carbohydrates_g": 12.0,
      "protein_g": 4.67,
      "fat_g": 3.33,
      "fiber_g": 3.0,
      "sodium_mg": 310.0,
      "potassium_mg": 210.0,
      "calcium_mg": 24.0,
      "iron_mg": 1.5
    },
    "glycemic_profile": {
      "index": 35,
      "category": "LOW"
    },
    "serving_units": [
      { "unit_name": "1 Standard Katori", "gram_weight": 150.0, "is_default": true },
      { "unit_name": "1 Small Katori", "gram_weight": 100.0, "is_default": false },
      { "unit_name": "1 Large Bowl", "gram_weight": 220.0, "is_default": false },
      { "unit_name": "Grams", "gram_weight": 1.0, "is_default": false }
    ]
  },
  {
    "food_id": "IND_SOUTH_001",
    "ifct_code": "C012_COOKED",
    "name": {
      "english": "Steamed Idli",
      "hindi": "इडली",
      "regional_aliases": ["Rice Idli", "Mallipoo Idli"]
    },
    "category": "Breakfast Foods",
    "region": "SOUTH",
    "dietary_type": "VEGAN",
    "nutrients_per_100g": {
      "calories_kcal": 137.5,
      "carbohydrates_g": 30.0,
      "protein_g": 4.5,
      "fat_g": 0.5,
      "fiber_g": 2.0,
      "sodium_mg": 180.0,
      "potassium_mg": 110.0,
      "calcium_mg": 18.0,
      "iron_mg": 0.9
    },
    "glycemic_profile": {
      "index": 60,
      "category": "MEDIUM"
    },
    "serving_units": [
      { "unit_name": "1 Piece (Medium)", "gram_weight": 40.0, "is_default": true },
      { "unit_name": "1 Plate (2 Idlis)", "gram_weight": 80.0, "is_default": false },
      { "unit_name": "Grams", "gram_weight": 1.0, "is_default": false }
    ]
  },
  {
    "food_id": "IND_WEST_001",
    "ifct_code": "D005_COOKED",
    "name": {
      "english": "Kanda Poha",
      "hindi": "कांदा पोहा",
      "regional_aliases": ["Poha", "Avalakki", "Pohe"]
    },
    "category": "Snacks & Breakfast",
    "region": "WEST",
    "dietary_type": "VEGAN",
    "nutrients_per_100g": {
      "calories_kcal": 146.7,
      "carbohydrates_g": 24.0,
      "protein_g": 2.67,
      "fat_g": 4.67,
      "fiber_g": 2.0,
      "sodium_mg": 240.0,
      "potassium_mg": 130.0,
      "calcium_mg": 22.0,
      "iron_mg": 2.1
    },
    "glycemic_profile": {
      "index": 62,
      "category": "MEDIUM"
    },
    "serving_units": [
      { "unit_name": "1 Standard Katori", "gram_weight": 150.0, "is_default": true },
      { "unit_name": "1 Plate", "gram_weight": 200.0, "is_default": false },
      { "unit_name": "Grams", "gram_weight": 1.0, "is_default": false }
    ]
  },
  {
    "food_id": "IND_SWEET_001",
    "ifct_code": "S002_COOKED",
    "name": {
      "english": "Gulab Jamun",
      "hindi": "गुलाब जामुन",
      "regional_aliases": ["Gulab Jam"]
    },
    "category": "Sweets & Desserts",
    "region": "PAN_INDIAN",
    "dietary_type": "VEGETARIAN",
    "nutrients_per_100g": {
      "calories_kcal": 350.0,
      "carbohydrates_g": 52.0,
      "protein_g": 5.0,
      "fat_g": 14.0,
      "fiber_g": 0.6,
      "sodium_mg": 85.0,
      "potassium_mg": 95.0,
      "calcium_mg": 120.0,
      "iron_mg": 0.5
    },
    "glycemic_profile": {
      "index": 78,
      "category": "HIGH"
    },
    "serving_units": [
      { "unit_name": "1 Piece (with syrup)", "gram_weight": 50.0, "is_default": true },
      { "unit_name": "1 Small Bowl (2 Pcs)", "gram_weight": 100.0, "is_default": false },
      { "unit_name": "Grams", "gram_weight": 1.0, "is_default": false }
    ]
  }
]
```

---

## Key Recommendations for Main App Implementation
1. **Raw vs Cooked Toggle**: Always maintain a UI toggle allowing users to enter either raw ingredients (for home cooks who weigh raw dal/rice before cooking) or cooked portions (using standard Katori/Roti count).
2. **Dynamic Oil Slider**: Provide a quick "+ Oil / Ghee" slider on the meal logging screen to adjust for dish richness (0.5 tsp to 1 tbsp).
3. **GI Indicator**: Display color-coded Glycemic Index badges (Green <= 55, Yellow 56-69, Red >= 70) to assist diabetic and insulin-resistant users managing Indian high-carb diets.
