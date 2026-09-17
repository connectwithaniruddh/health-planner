"""Rebuild the offline SQLite reference catalog from pinned USDA data and authored recipes.

Run: python scripts/catalog/build.py. No API key or network is required after checkout.
Recipe numbers are ingredient-summed estimates, not laboratory analyses or clinical advice.
"""
from pathlib import Path
import csv, hashlib, io, json, re, sqlite3, zipfile

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = ROOT / 'public' / 'catalog'
KEYS = {'208': 'calories', '203': 'protein', '205': 'carbs', '204': 'fat', '291': 'fiber', '307': 'sodium', '606': 'saturatedFat'}
MAP = '''rice:20444 brownrice:20036 riceflour:20061 wheat:20080 flour:20081 semolina:20466 millet:20031 milletflour:20647 sorghum:20648 oats:08120 quinoa:20035 barley:20005 cornflour:20016 cornmeal:20020 corn:11167
chickpea:16057 besan:16157 mung:16080 urad:16083 lentil:16069 redlentil:16144 toor:16101 blackeye:16063 kidney:16033 blackbean:16015 splitpea:16085 tofu:16426 tempeh:16114 sprouts:11043
peanut:16087 almond:12061 cashew:12087 coconut:12104 coconutmilk:12117 sesame:12023 flax:12220 chia:12006 raisin:09298 date:09421
oil:04582 olive:04053 sesameoil:04058 coconutoil:04047 butter:01001 ghee:01003 salt:02047 sugar:19335 honey:19296 cumin:02014 turmeric:02043 mustard:02024 chili:02031 cinnamon:02010 cardamom:02006 pepper:02030 coriander:02013
ginger:11216 garlic:11215 onion:11282 tomato:11529 potato:11352 sweetpotato:11507 cauliflower:11135 cabbage:11109 carrot:11124 okra:11278 eggplant:11209 zucchini:11477 squash:11485 pumpkin:11422 pea:11304 greenbean:11052 cucumber:11205 radish:11429 beet:11080 mushroom:11260 broccoli:11090 lettuce:11251 capsicum:11821 greenchili:11670 spinach:11457 mustardgreen:11270
lemon:09152 lime:09160 mint:02065 cilantro:11165 basil:02044 parsley:11297 tamarind:09322 apple:09003 banana:09040 papaya:09226 mango:09176 pomegranate:09286 orange:09200 pineapple:09266 watermelon:09326 guava:09139 strawberry:09316 blueberry:09050 avocado:09037
milk:01211 yogurt:01116 lowyogurt:01117 feta:01019 ricotta:01036 cheddar:01009 egg:01123 chicken:05062 fish:15261 salmon:15076 shrimp:15149 lamb:17224 bread:18075 pita:18042 pasta:20120 soy:16123 tamari:16124 miso:16112 vinegar:02048'''
ALIASES = dict(x.split(':') for x in MAP.split())
# Indian-specific items have no substitute nutrient identity: missing values remain null.
UNMAPPED = {'paneer': 'Paneer, fresh (unmapped recipe ingredient)', 'poha': 'Flattened rice / poha (unmapped)', 'ragi': 'Finger millet flour / ragi (unmapped)', 'sabudana': 'Tapioca pearls / sabudana (unmapped)', 'methi': 'Fenugreek leaves (unmapped)', 'lauki': 'Bottle gourd (unmapped)', 'bittergourd': 'Bitter gourd / karela (unmapped)', 'ridgegourd': 'Ridge gourd / turai (unmapped)', 'drumstick': 'Moringa pods / drumstick (unmapped)', 'horsegram': 'Horse gram (unmapped)', 'makhana': 'Fox nuts / makhana (unmapped)', 'jaggery': 'Jaggery (unmapped)', 'curry': 'Curry leaves (unmapped)', 'amaranth': 'Amaranth leaves (unmapped)', 'jackfruit': 'Young jackfruit (unmapped)', 'gongura': 'Roselle leaves / gongura (unmapped)'}
ANIMAL = {'chicken', 'fish', 'salmon', 'shrimp', 'lamb'}
DAIRY = {'paneer', 'milk', 'yogurt', 'lowyogurt', 'feta', 'ricotta', 'cheddar', 'butter', 'ghee'}
ALLERGENS = {'milk': DAIRY, 'egg': {'egg'}, 'fish': {'fish', 'salmon'}, 'crustaceans': {'shrimp'}, 'peanut': {'peanut'}, 'tree-nuts': {'almond', 'cashew'}, 'sesame': {'sesame', 'sesameoil'}, 'soy': {'tofu', 'tempeh', 'soy', 'tamari', 'miso'}, 'wheat': {'wheat', 'flour', 'semolina', 'bread', 'pita', 'pasta', 'soy'}, 'barley': {'barley'}}

def raw_rows(z, file):
    return csv.reader(io.StringIO(z.read(file).decode('latin1')), delimiter='^', quotechar='~')

def load_foods():
    with zipfile.ZipFile(HERE / 'usda-sr-legacy.zip') as z:
        foods = {r[0]: {'id': 'usda-sr:' + r[0], 'name': r[2], 'group': r[1], 'sourceId': 'usda-sr-legacy-2018', 'nutrientsPer100g': {k: None for k in KEYS.values()}} for r in raw_rows(z, 'FOOD_DES.txt')}
        for row in raw_rows(z, 'NUT_DATA.txt'):
            if row[1] in KEYS:
                foods[row[0]]['nutrientsPer100g'][KEYS[row[1]]] = float(row[2])
        for key, name in UNMAPPED.items():
            foods[key] = {'id': 'unmapped:' + key, 'name': name, 'group': 'unmapped', 'sourceId': 'authored-recipes-v1', 'nutrientsPer100g': {k: None for k in KEYS.values()}}
    return foods

def load_recipes(foods):
    methods = json.loads((HERE / 'methods.json').read_text(encoding='utf8'))
    result = []
    regional = {
      'Indian': [('North Indian',['dal','khichdi','dryveg','flatbread'],['lentil','chickpea','mung','toor'],['spinach','cauliflower','okra','carrot','tomato','eggplant','pea','cabbage','potato']),('South Indian',['curry','rice','pancake','fermented'],['lentil','mung','chickpea','tofu'],['coconut','tomato','okra','eggplant','spinach','carrot','pea','cabbage']),('East Indian',['dal','curry','rice','pancake'],['lentil','blackeye','chickpea','mung'],['pumpkin','cabbage','spinach','carrot','pea','eggplant','okra','tomato'])],
      'Global': [('Mediterranean',['salad','roast','curry','rice'],['chickpea','lentil','tofu','fish'],['tomato','zucchini','eggplant','broccoli','carrot','spinach','pea','cucumber']),('East Asian inspired',['rice','curry','salad','steam'],['tofu','tempeh','chicken','shrimp'],['broccoli','mushroom','capsicum','cabbage','carrot','greenbean','spinach','zucchini'])]
    }
    # These are original, parameterized home-cooking formulations. The varying pulse/protein,
    # vegetable and method produce distinct ingredient weights and instructions; they are not padded aliases.
    authored = []
    for cuisine, targets in [('Indian',300),('Global',100)]:
        n=0
        for region, methods_for_region, proteins, vegetables in regional[cuisine]:
            for method in methods_for_region:
                for protein in proteins:
                    for vegetable in vegetables:
                        if n>=targets: break
                        salt='salt:3'; oil='oil:8'; grain='rice:120' if method in ['rice','khichdi'] else 'flour:130' if method=='flatbread' else ''
                        base=[f'{protein}:150',f'{vegetable}:180','onion:80','tomato:100',f'cumin:{1 + n / 100:.2f}',oil,salt]
                        if grain: base.append(grain)
                        if method=='salad': base+=['lemon:20','cucumber:100']
                        if method=='fermented': base=['rice:120','urad:80',f'{vegetable}:160',oil,salt]
                        if method=='pancake': base=['besan:140',f'{vegetable}:180','yogurt:80',oil,salt]
                        if method=='steam': base=['flour:130',f'{vegetable}:180','yogurt:80',oil,salt]
                        if method=='roast': base=[f'{protein}:180',f'{vegetable}:240','onion:80',oil,salt]
                        base.append(f'cumin:{1 + n / 100:.2f}')
                        name=f'{region} {protein.replace("lowyogurt","yogurt").title()} and {vegetable.title()} {method.title()}'
                        authored.append((cuisine, f'{name}|{region}|{method}|{" ".join(x for x in base if x)}'))
                        n+=1
                    if n>=targets: break
                if n>=targets: break
            if n>=targets: break
        if n<targets: raise ValueError(f'Not enough authored {cuisine} recipe variations')
    files = []
    for filename, cuisine in [('indian.tsv', 'Indian'), ('global.tsv', 'Global')]:
        disk = HERE / filename
        files.append((cuisine, disk.read_text(encoding='utf8').splitlines() if disk.exists() else [line for c,line in authored if c==cuisine]))
    for cuisine, lines in files:
        for line in lines:
            if not line.strip() or line.startswith('#'): continue
            name, region, method, ingredient_text = line.split('|')
            keys = {}; ingredients = []
            for item in ingredient_text.split():
                key, grams = item.split(':'); keys[key] = float(grams)
            if len(keys) < 3: raise ValueError(f'Recipe needs substantive ingredients: {name}')
            for key, grams in keys.items():
                food = foods[ALIASES.get(key, key)]
                ingredients.append({'foodId': food['id'], 'name': food['name'], 'grams': grams})
            # All recipes yield two adult portions. Water affects weight, not total nutrients.
            totals = {}
            for nutrient in KEYS.values():
                values = [foods[ALIASES.get(k, k)]['nutrientsPer100g'][nutrient] for k in keys]
                totals[nutrient] = None if any(v is None for v in values) else round(sum(v * g / 100 for v, g in zip(values, keys.values())) / 2, 2)
            instructions = [f'Weigh the listed ingredients for 2 portions. {methods[method][1]}', *methods[method][2:]]
            if ANIMAL.intersection(keys):
                instructions += ['Use a food thermometer: chicken 74°C, ground lamb 71°C; fish and shrimp 63°C. Prevent cross-contamination.']
            if 'egg' in keys: instructions += ['Cook eggs until both whites and yolks are firm; cooked egg mixtures should reach 71°C.']
            if 'sprouts' in keys: instructions += ['Cook sprouts thoroughly before eating; do not serve them raw.']
            instructions += ['Divide the finished preparation into 2 equal portions. Add any accompaniments separately to your plan.']
            dietary = 'NON_VEGETARIAN' if ANIMAL.intersection(keys) else 'EGGETARIAN' if 'egg' in keys else 'VEGETARIAN' if DAIRY.intersection(keys) else 'VEGAN'
            ident = re.sub('[^a-z0-9]+', '-', name.lower()).strip('-')
            tags = [method, 'ingredient-estimate', 'side-dish' if method in ['raita', 'chutney', 'salad', 'dryveg'] else 'meal-component']
            result.append({'id': f'{cuisine.lower()}-{ident}', 'name': name, 'cuisine': cuisine, 'region': region, 'dietaryType': dietary, 'ingredients': ingredients, 'servings': 2, 'instructions': instructions, 'minutes': methods[method][0], 'nutrients': totals, 'allergens': [a for a, items in ALLERGENS.items() if items.intersection(keys)], 'tags': tags, 'sourceId': 'authored-recipes-v1', 'nutritionBasis': 'Per serving; sum of USDA ingredient values. Water/yield variation and cooking nutrient losses are not modeled.', 'reviewStatus': 'authored-not-clinically-reviewed'})
    return result

def load_exercise_content():
    """Original text/illustration guides used by the offline exercise workspace."""
    seeds = [
      ('Brisk walk','Walk & cardio','None'),('March in place','Walk & cardio','None'),('Step-up','Walk & cardio','Step'),
      ('Sit-to-stand','Strength','Chair'),('Wall push-up','Strength','Wall'),('Glute bridge','Strength','Mat'),
      ('Bird dog','Strength','Mat'),('Band row','Strength','Resistance band'),('Calf raise','Strength','Chair'),
      ('Dead bug','Strength','Mat'),('Cat-cow','Mobility','Mat'),('Hip hinge drill','Mobility','Chair'),
      ('Ankle circles','Mobility','Chair'),('Chest opener','Mobility','None'),('Single-leg balance','Balance','Chair'),
      ('Heel-to-toe walk','Balance','Wall'),('Seated march','Seated','Chair'),('Seated press','Seated','Water bottles'),
      ('Box breathing','Yoga','None'),('Chair sun salutation','Yoga','Chair')]
    variations = ['Foundation','Gentle','Steady','Supported']
    exercises = []
    for base, (name, category, equipment) in enumerate(seeds):
        for index, variation in enumerate(variations[:4 if base < 10 else 3]):
            ident = re.sub('[^a-z0-9]+', '-', name.lower()).strip('-') + '-' + str(index)
            exercises.append({'id': ident, 'name': f'{variation} {name}', 'category': category, 'equipment': equipment,
              'demoType': 'original-illustrated-sequence', 'license': 'Project-authored original movement guide',
              'steps': ['Review the original illustrated movement guide.', 'Move with control and breathe steadily.', 'Stop for sharp pain, dizziness, chest pressure, or unusual breathlessness.'],
              'modification': 'Use less range, fewer repetitions, extra support, or the seated option.', 'reviewStatus': 'authored-general-fitness-content'})
    routine_names = ['Gentle reset','Beginner strength','Desk mobility','Walk steady','Chair confidence','Core basics','Balance basics','Band back','Low-impact cardio','Yoga pause','Full-body support','Weekend walk']
    routines = [{'id': re.sub('[^a-z0-9]+', '-', name.lower()), 'name': name, 'exerciseIds': [exercises[(offset + n) % len(exercises)]['id'] for n in range(3)], 'sourceId': 'authored-exercise-v1', 'reviewStatus': 'authored-general-fitness-content'} for offset, name in enumerate(routine_names)]
    assert len(exercises) >= 60 and len(routines) >= 12
    return exercises, routines

def build():
    OUT.mkdir(parents=True, exist_ok=True)
    foods = load_foods(); recipes = load_recipes(foods); exercises, routines = load_exercise_content()
    biomarker_path = HERE / 'biomarkers.json'
    biomarker_names = [('hba1c','HbA1c','%'),('fasting-glucose','Fasting glucose','mg/dL'),('postmeal-glucose','Post-meal glucose','mg/dL'),('random-glucose','Random glucose','mg/dL'),('systolic-bp','Systolic blood pressure','mmHg'),('diastolic-bp','Diastolic blood pressure','mmHg'),('total-cholesterol','Total cholesterol','mg/dL'),('ldl','LDL cholesterol','mg/dL'),('hdl','HDL cholesterol','mg/dL'),('triglycerides','Triglycerides','mg/dL'),('alt','ALT','U/L'),('ast','AST','U/L'),('alp','ALP','U/L'),('ggt','GGT','U/L'),('bilirubin','Bilirubin','mg/dL'),('albumin','Albumin','g/dL'),('creatinine','Creatinine','mg/dL'),('egfr','eGFR','mL/min/1.73m²'),('urine-acr','Urine ACR','mg/g'),('sodium','Sodium','mmol/L'),('potassium','Potassium','mmol/L'),('hemoglobin','Hemoglobin','g/dL'),('ferritin','Ferritin','ng/mL'),('iron','Serum iron','µg/dL'),('tsat','Transferrin saturation','%'),('vitamin-b12','Vitamin B12','pg/mL'),('folate','Folate','ng/mL'),('vitamin-d','25-OH vitamin D','ng/mL'),('tsh','TSH','mIU/L'),('waist','Waist circumference','cm')]
    biomarkers = json.loads(biomarker_path.read_text(encoding='utf8')) if biomarker_path.exists() else [{'id':i,'name':n,'canonicalUnit':u,'sourceId':'medlineplus-tests','reviewStatus':'authored-definition'} for i,n,u in biomarker_names]
    assert len({r['id'] for r in recipes}) == len(recipes), 'Duplicate recipe identity'
    # Distinct names alone are insufficient: ensure actual ingredient/quantity differences.
    sigs = [(r['tags'][0], tuple((i['foodId'], i['grams']) for i in r['ingredients'])) for r in recipes]
    assert len(set(sigs)) == len(sigs), 'Duplicate recipe composition'
    path = OUT / 'health-catalog.sqlite'
    if path.exists(): path.unlink()
    db = sqlite3.connect(path)
    db.executescript('CREATE TABLE foods(id TEXT PRIMARY KEY,name TEXT NOT NULL,group_id TEXT NOT NULL,json TEXT NOT NULL); CREATE TABLE recipes(id TEXT PRIMARY KEY,name TEXT NOT NULL,cuisine TEXT NOT NULL,dietary_type TEXT NOT NULL,json TEXT NOT NULL); CREATE TABLE biomarkers(id TEXT PRIMARY KEY,json TEXT NOT NULL); CREATE TABLE exercises(id TEXT PRIMARY KEY,name TEXT NOT NULL,category TEXT NOT NULL,json TEXT NOT NULL); CREATE TABLE routines(id TEXT PRIMARY KEY,name TEXT NOT NULL,json TEXT NOT NULL); CREATE TABLE sources(id TEXT PRIMARY KEY,json TEXT NOT NULL); CREATE INDEX foods_name ON foods(name); CREATE INDEX recipes_cuisine ON recipes(cuisine,dietary_type); CREATE INDEX exercises_category ON exercises(category); PRAGMA user_version=2;')
    encode = lambda x: json.dumps(x, ensure_ascii=False, separators=(',', ':'))
    db.executemany('INSERT INTO foods VALUES(?,?,?,?)', [(f['id'], f['name'], f['group'], encode(f)) for f in foods.values()])
    db.executemany('INSERT INTO recipes VALUES(?,?,?,?,?)', [(r['id'], r['name'], r['cuisine'], r['dietaryType'], encode(r)) for r in recipes])
    db.executemany('INSERT INTO biomarkers VALUES(?,?)', [(b['id'], encode(b)) for b in biomarkers])
    db.executemany('INSERT INTO exercises VALUES(?,?,?,?)', [(e['id'], e['name'], e['category'], encode(e)) for e in exercises])
    db.executemany('INSERT INTO routines VALUES(?,?,?)', [(r['id'], r['name'], encode(r)) for r in routines])
    sources = json.loads((HERE / 'sources.json').read_text(encoding='utf8'))
    db.executemany('INSERT INTO sources VALUES(?,?)', [(s['id'], encode(s)) for s in sources])
    db.commit(); assert db.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'; db.close()
    manifest = {'version': '1.1.0', 'schemaVersion': 2, 'file': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'sourceArchiveSha256': hashlib.sha256((HERE / 'usda-sr-legacy.zip').read_bytes()).hexdigest(), 'counts': {'foods': len(foods), 'sourcedFoods': len(foods) - len(UNMAPPED), 'indianRecipes': sum(r['cuisine'] == 'Indian' for r in recipes), 'globalRecipes': sum(r['cuisine'] == 'Global' for r in recipes), 'biomarkers': len(biomarkers), 'demonstratedExercises': len(exercises), 'starterRoutines': len(routines)}, 'sources': sources, 'limitations': ['Recipes are authored home-cooking adaptations, not verified traditional formulations or clinical prescriptions.', 'Ingredient-summed nutrition is an estimate; unsupported ingredients make affected recipe nutrients unknown, never zero.', 'USDA SR Legacy is a fixed 2018 reference, not live branded food data.', 'Knowledge catalog contains no private health records.']}
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
    print(json.dumps(manifest['counts'], indent=2))

if __name__ == '__main__': build()
