import { useEffect, useState, useMemo } from 'react';
import { CalendarDays, LockKeyhole, Unlock, RefreshCw, Heart, Plus, ArrowRight, ShoppingBasket, Check, Undo2, ShieldCheck, Sparkles, Flame } from 'lucide-react';
import { loadCatalog, type CatalogRecipe } from '../catalog';
import { useHealthStore } from '../domain/healthStore';
import { addDays, today, dateLabel } from './dates';
import { generatePlan, rankRecipes, totals, groceryList, type MealPlan, type PlanEntry, type Slot, type Preference } from './plannerEngine';

// Evidence-based Therapeutic Indian Recipes tailored for Sedentary IT workers with NAFLD / Pre-Diabetes / Cholesterol
const THERAPEUTIC_RECIPES: CatalogRecipe[] = [
  {
    id: 'rec-chilla-moong-besan',
    name: 'Sprouted Moong & Besan Chilla with Mint Raita',
    cuisine: 'North Indian',
    region: 'North',
    dietaryType: 'VEGETARIAN',
    servings: 1,
    minutes: 15,
    ingredients: [
      { foodId: 'besan-flour', name: 'Besan (Gram Flour)', grams: 35 },
      { foodId: 'sprouted-moong', name: 'Sprouted Green Moong', grams: 45 },
      { foodId: 'curd-cow', name: 'Fresh Cow Milk Dahi / Curd (B12 support)', grams: 100 },
      { foodId: 'spinach-grated', name: 'Spinach / Lauki (Grated)', grams: 40 },
      { foodId: 'mustard-oil', name: 'Cold-Pressed Mustard Oil', grams: 5 }
    ],
    instructions: [
      'Blend sprouted moong coarsely; mix with besan, grated lauki, turmeric, ajwain, and water to form batter.',
      'Pour onto non-stick iron tawa with 1 tsp cold-pressed oil; cook both sides until crisp golden.',
      'Serve fresh with homemade dahi sprinkled with roasted cumin (jeera) and mint.'
    ],
    allergens: ['dairy'],
    tags: ['breakfast', 'lunch', 'nafld-safe', 'low-gi', 'b12-support', 'high-protein'],
    nutrients: {
      calories: 310,
      protein: 18,
      carbs: 38,
      fat: 9,
      fiber: 8.5,
      sodium: 180,
      saturatedFat: 2.2
    }
  },
  {
    id: 'rec-jowar-palak-dal',
    name: 'Jowar Bhakri with Palak Moong Dal',
    cuisine: 'Maharashtrian / Central Indian',
    region: 'Central',
    dietaryType: 'VEGAN',
    servings: 1,
    minutes: 25,
    ingredients: [
      { foodId: 'jowar-flour', name: 'Jowar (Sorghum) Flour', grams: 45 },
      { foodId: 'yellow-moong', name: 'Split Yellow Moong Dal', grams: 40 },
      { foodId: 'fresh-palak', name: 'Fresh Spinach (Palak)', grams: 80 },
      { foodId: 'garlic-turmeric', name: 'Crushed Garlic & Turmeric (Curcumin)', grams: 10 },
      { foodId: 'sesame-oil', name: 'Cold-Pressed Sesame Oil', grams: 5 }
    ],
    instructions: [
      'Knead jowar flour with warm water; pat into a round flatbread (bhakri) and roast on tawa.',
      'Cook yellow moong dal with finely chopped spinach, crushed garlic, and turmeric.',
      'Temper lightly with cumin seeds and hing; enjoy warm for sustained satiety without glucose spikes.'
    ],
    allergens: [],
    tags: ['lunch', 'dinner', 'nafld-safe', 'low-gi', 'high-fiber', 'heart-safe'],
    nutrients: {
      calories: 365,
      protein: 17,
      carbs: 58,
      fat: 6.5,
      fiber: 12.5,
      sodium: 210,
      saturatedFat: 1.1
    }
  },
  {
    id: 'rec-sattu-cooler-4pm',
    name: 'Roasted Sattu Buttermilk Cooler (4 PM Office Slump)',
    cuisine: 'Bihari / Indian',
    region: 'East',
    dietaryType: 'VEGAN',
    servings: 1,
    minutes: 5,
    ingredients: [
      { foodId: 'chana-sattu', name: 'Roasted Bengal Gram (Sattu) Flour', grams: 30 },
      { foodId: 'water-chilled', name: 'Chilled Water / Thin Chaas', grams: 250 },
      { foodId: 'lemon-mint', name: 'Fresh Lemon Juice & Mint', grams: 15 },
      { foodId: 'black-salt-jeera', name: 'Black Salt & Roasted Cumin', grams: 3 }
    ],
    instructions: [
      'Whisk roasted chana sattu in chilled water or thin buttermilk until smooth.',
      'Add freshly squeezed lemon juice, black salt, roasted cumin powder, and crushed mint.',
      'Drink at 4 PM to defeat the office snack craving with zero added sugar and high plant protein.'
    ],
    allergens: [],
    tags: ['snack', 'nafld-safe', 'low-gi', 'high-protein'],
    nutrients: {
      calories: 125,
      protein: 8.5,
      carbs: 18,
      fat: 1.8,
      fiber: 5.5,
      sodium: 140,
      saturatedFat: 0.3
    }
  },
  {
    id: 'rec-bhuna-chana-trail',
    name: 'Roasted Bhuna Chana & Pumpkin Seed Desk Mix',
    cuisine: 'Pan-Indian',
    region: 'Central',
    dietaryType: 'VEGAN',
    servings: 1,
    minutes: 5,
    ingredients: [
      { foodId: 'bhuna-chana', name: 'Dry-Roasted Bengal Gram with Skin', grams: 35 },
      { foodId: 'pumpkin-seeds', name: 'Raw Pumpkin Seeds (Zinc & Magnesium)', grams: 15 },
      { foodId: 'chaat-amla', name: 'Amla Powder & Chaat Masala', grams: 3 }
    ],
    instructions: [
      'Toss whole roasted chana with raw pumpkin seeds and amla powder.',
      'Keep in an airtight jar on your office desk for a crunchy, zero-trans-fat snack.'
    ],
    allergens: [],
    tags: ['snack', 'nafld-safe', 'low-gi', 'heart-safe'],
    nutrients: {
      calories: 195,
      protein: 11,
      carbs: 22,
      fat: 7.5,
      fiber: 6.8,
      sodium: 90,
      saturatedFat: 1.2
    }
  },
  {
    id: 'rec-methi-sprout-sundal',
    name: 'Sprouted Methi & Green Gram Sundal',
    cuisine: 'South Indian',
    region: 'South',
    dietaryType: 'VEGAN',
    servings: 1,
    minutes: 15,
    ingredients: [
      { foodId: 'sprouted-moong-methi', name: 'Sprouted Moong & Methi (Fenugreek) Seeds', grams: 80 },
      { foodId: 'grated-coconut', name: 'Fresh Grated Coconut', grams: 10 },
      { foodId: 'mustard-curry-leaves', name: 'Mustard Seeds, Hing & Curry Leaves', grams: 5 },
      { foodId: 'lemon-fresh', name: 'Fresh Lemon Juice', grams: 10 }
    ],
    instructions: [
      'Steam sprouted moong and slightly bitter sprouted methi for 5 minutes.',
      'Temper with mustard seeds, hing, and curry leaves in 1/2 tsp oil.',
      'Fold in fresh grated coconut and lemon juice. 4-hydroxyisoleucine in methi stimulates natural insulin sensitivity.'
    ],
    allergens: [],
    tags: ['snack', 'lunch', 'nafld-safe', 'low-gi', 'heart-safe'],
    nutrients: {
      calories: 175,
      protein: 9.5,
      carbs: 24,
      fat: 4.8,
      fiber: 7.2,
      sodium: 75,
      saturatedFat: 2.5
    }
  },
  {
    id: 'rec-soya-methi-curry',
    name: 'High-Protein Soya Chunks & Methi Sabzi',
    cuisine: 'North Indian',
    region: 'North',
    dietaryType: 'VEGAN',
    servings: 1,
    minutes: 20,
    ingredients: [
      { foodId: 'soya-chunks', name: 'Soya Chunks (Nutrela)', grams: 45 },
      { foodId: 'methi-leaves', name: 'Fresh Fenugreek (Methi) Leaves', grams: 60 },
      { foodId: 'onion-tomato', name: 'Tomato-Onion-Ginger Gravy', grams: 80 },
      { foodId: 'groundnut-oil', name: 'Cold-Pressed Groundnut Oil', grams: 5 }
    ],
    instructions: [
      'Boil soya chunks in water with a pinch of salt; squeeze out excess water completely.',
      'Saute onions, ginger, garlic, tomatoes, and chopped fresh methi leaves with turmeric and coriander.',
      'Add soya chunks, simmer with a splash of water for 8 minutes. Provides 24g pure plant protein with zero cholesterol.'
    ],
    allergens: ['soy'],
    tags: ['lunch', 'dinner', 'nafld-safe', 'low-gi', 'high-protein'],
    nutrients: {
      calories: 285,
      protein: 24.5,
      carbs: 26,
      fat: 6.2,
      fiber: 9.5,
      sodium: 195,
      saturatedFat: 0.9
    }
  }
];

export function MealPlanner() {
  const { state, update } = useHealthStore();
  const [recipes, setRecipes] = useState<CatalogRecipe[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState(today());
  const [day, setDay] = useState(today());
  const [view, setView] = useState('week');
  const [inspector, setInspector] = useState<PlanEntry | null>(null);
  const [search, setSearch] = useState('');
  const [slot, setSlot] = useState<Slot>('lunch');
  const [grocery, setGrocery] = useState(false);
  const [undo, setUndo] = useState<MealPlan[]>([]);
  const [message, setMessage] = useState('');
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    loadCatalog()
      .then(c => setRecipes(c.recipes))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const plan = state.plans[0] as MealPlan | undefined;
  
  // Merge catalog recipes with therapeutic Indian recipes and custom user recipes
  const allRecipes = useMemo(() => {
    const customList = (state.customRecipes || []) as CatalogRecipe[];
    return [...THERAPEUTIC_RECIPES, ...recipes, ...customList];
  }, [recipes, state.customRecipes]);

  const events = state.preferenceEvents as Preference[];

  useEffect(() => {
    if (plan) {
      setStart(plan.startDate);
      if (day < plan.startDate || day > addDays(plan.startDate, 29)) setDay(plan.startDate);
    }
  }, [plan?.id]);

  async function save(next: MealPlan) {
    if (plan) setUndo(u => [...u.slice(-9), structuredClone(plan)]);
    return update(s => {
      s.plans = [next, ...s.plans.filter((p: any) => p.id !== next.id && p.id !== plan?.id)];
    });
  }

  async function edit(id: string, fn: (entry: PlanEntry) => void) {
    if (!plan) return;
    const copy = structuredClone(plan);
    const entry = copy.entries.find(e => e.id === id);
    if (entry) fn(entry);
    copy.updatedAt = new Date().toISOString();
    await save(copy);
    if (inspector?.id === id) setInspector(entry || null);
  }

  async function generate() {
    // Only halt generation if end-stage liver cirrhosis or kidney failure
    if (/cirrhosis|end.?stage|transplant/i.test(`${(state.profile.conditions || []).join(' ')} ${state.profile.clinicalNotes || ''}`)) {
      setError('Advanced clinical liver/kidney conditions require direct specialist clinical supervision. Automated generation is paused.');
      return;
    }

    const next = generatePlan(allRecipes, state.profile, events, start, plan?.startDate === start ? plan : undefined);
    if (!next.entries.length) {
      setError('No compatible recipes found matching your dietary preference. Review preferences or add custom recipes.');
      return;
    }

    setError('');
    if (await save(next)) {
      setDay(start);
      setMessage('Your personalized 30-day plan is ready with NAFLD & low-GI recommendations.');
    }
  }

  async function add(r: CatalogRecipe) {
    const entry: PlanEntry = {
      id: inspector?.id || crypto.randomUUID(),
      date: day,
      slot: inspector?.slot || slot,
      recipe: structuredClone(r),
      portions: inspector?.portions || 1,
      locked: inspector?.locked || false,
      reason: 'Selected by you'
    };
    const next: MealPlan = plan
      ? structuredClone(plan)
      : { id: crypto.randomUUID(), startDate: start, entries: [], updatedAt: new Date().toISOString() };
    next.entries = next.entries.filter(e => e.id !== entry.id);
    next.entries.push(entry);
    if (await save(next)) {
      await update(s => {
        s.preferenceEvents.push({ id: crypto.randomUUID(), recipeId: r.id, kind: 'selected', at: new Date().toISOString() });
      });
      setInspector(entry);
      setMessage('Meal saved.');
    }
  }

  const dayEntries = (plan?.entries || []).filter(e => e.date === day);
  const nutrient = totals(dayEntries);
  const days = Array.from({ length: view === 'month' ? 30 : view === 'day' ? 1 : 7 }, (_, i) =>
    addDays(view === 'month' ? plan?.startDate || start : day, i)
  ).filter(d => !plan || d <= addDays(plan.startDate, 29));

  const ranked = rankRecipes(allRecipes, state.profile, events, inspector?.slot || slot).filter(x =>
    `${x.recipe.name} ${x.recipe.cuisine} ${x.recipe.region} ${x.recipe.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-stack space-y-6">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow font-bold text-xs uppercase">THERAPEUTIC NUTRITION & INDIAN MEAL PLANNER</span>
          <h1 className="text-ink mt-1">
            Personalized Meal Planning.<br />
            <em>Supporting Liver & Metabolic Recovery.</em>
          </h1>
          <p className="muted text-sm mt-1 max-w-2xl">
            Sourced for South Asian desk professionals. Every recipe prioritizes low-glycemic carbs (Jowar, Bajra, Moong), high soluble fiber to clear hepatic triglycerides, and zero added fructose.
          </p>
        </div>
        <button className="secondary-btn flex items-center gap-2" onClick={() => setGrocery(!grocery)}>
          <ShoppingBasket size={17} />
          <span>Grocery List</span>
        </button>
      </div>

      {error && <p className="notice error text-xs" role="alert">{error}</p>}
      {message && <p className="notice text-xs" role="status">{message}</p>}

      {/* Toolbar */}
      <section className="surface p-4 rounded-2xl border border-rule flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold flex items-center gap-2">
            <span>Plan starts:</span>
            <input
              aria-label="Plan starts"
              type="date"
              value={start}
              onChange={e => setStart(e.target.value)}
              className="form-input text-xs py-1 px-2 w-auto"
            />
          </label>

          <div className="segmented flex bg-black/5 dark:bg-white/5 p-1 rounded-full border border-rule">
            {['day', 'week', 'month'].map(v => (
              <button
                key={v}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${view === v ? 'bg-white dark:bg-neutral-800 text-ink shadow-sm' : 'text-muted'}`}
                onClick={() => setView(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="secondary-btn text-xs py-1.5 px-3 flex items-center gap-1.5"
            disabled={!undo.length}
            onClick={async () => {
              const previous = undo.at(-1);
              if (previous && (await update(s => { s.plans = [previous]; }))) {
                setUndo(u => u.slice(0, -1));
                setInspector(null);
              }
            }}
          >
            <Undo2 size={14} />
            <span>Undo</span>
          </button>

          <button
            className="primary-btn text-xs py-1.5 px-4 flex items-center gap-2"
            disabled={loading || !allRecipes.length}
            onClick={generate}
          >
            <RefreshCw size={14} />
            <span>{plan ? 'Refresh Plan' : 'Generate 30-Day Plan'}</span>
          </button>
        </div>
      </section>

      {/* Empty State */}
      {!plan && (
        <div className="surface p-8 rounded-3xl border border-rule text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CalendarDays size={28} />
          </div>
          <h2 className="text-xl font-bold text-ink">Your Personalized 30-Day Month Starts Here</h2>
          <p className="text-sm muted max-w-md mx-auto">
            {loading ? 'Loading your offline recipe catalog…' : 'Generate an automated, clinically tailored Indian plan or pick therapeutic recipes below.'}
          </p>
          <p className="text-xs text-muted">
            Calibrated for {Number(state.profile.targetCalories) || 1600} kcal/day target with negative deficit for fatty liver reduction.
          </p>
        </div>
      )}

      {/* Day Picker & Grid */}
      {plan && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {Array.from({ length: 30 }, (_, i) => addDays(plan.startDate, i)).map(d => (
              <button
                key={d}
                className={`p-2.5 rounded-2xl border min-w-[3.5rem] flex flex-col items-center transition-all ${
                  day === d
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                    : 'bg-surface border-rule text-muted hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                onClick={() => {
                  setDay(d);
                  setInspector(null);
                }}
              >
                <small className="text-[10px] font-semibold">{dateLabel(d, { weekday: 'short' })}</small>
                <strong className="text-base font-bold">{d.slice(-2)}</strong>
              </button>
            ))}
          </div>

          <div className={`planner-grid ${view} gap-4`}>
            {days.map(d => (
              <section className="day-column surface p-3.5 rounded-2xl border border-rule space-y-3" key={d}>
                <header className="flex justify-between items-center pb-2 border-b border-rule">
                  <strong className="text-xs font-bold text-ink">{dateLabel(d, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                  <button
                    className="text-muted hover:text-ink p-1"
                    title="Lock all meals for this day"
                    onClick={() => {
                      const copy = structuredClone(plan);
                      copy.entries.filter(e => e.date === d).forEach(e => (e.locked = true));
                      void save(copy);
                    }}
                  >
                    <LockKeyhole size={14} />
                  </button>
                </header>

                {(['breakfast', 'lunch', 'dinner', 'snack'] as Slot[]).map(sl => (
                  <div className="meal-slot space-y-1.5" key={sl}>
                    <span className="eyebrow text-[10px] uppercase font-bold text-muted">{sl}</span>
                    {plan.entries
                      .filter(e => e.date === d && e.slot === sl)
                      .map(e => (
                        <button
                          className={`meal-tile w-full text-left p-2.5 rounded-xl border transition-all ${
                            inspector?.id === e.id
                              ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                              : 'border-rule bg-black/5 dark:bg-white/5 hover:border-neutral-400'
                          }`}
                          key={e.id}
                          onClick={() => {
                            setDay(d);
                            setInspector(e);
                          }}
                        >
                          <span className="meal-name block text-xs font-bold text-ink truncate">{e.recipe.name}</span>
                          <span className="meal-meta text-[11px] text-muted flex items-center justify-between mt-0.5">
                            <span>
                              {e.nutritionOverride?.calories ?? e.recipe.nutrients.calories == null
                                ? 'Est. kcal'
                                : `${Math.round(((e.nutritionOverride?.calories ?? e.recipe.nutrients.calories) ?? 0) * e.portions)} kcal`}
                            </span>
                            {e.locked && <LockKeyhole size={11} className="text-emerald-500" />}
                          </span>
                        </button>
                      ))}
                    <button
                      className="add-slot w-full py-1 text-center text-xs text-muted border border-dashed border-rule rounded-lg hover:text-ink hover:border-neutral-400"
                      onClick={() => {
                        setDay(d);
                        setSlot(sl);
                        setInspector(null);
                        document.getElementById('recipe-search')?.focus();
                      }}
                    >
                      + Add {sl}
                    </button>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </>
      )}

      {/* Recipe Inspector & Search Explorer */}
      <div className="workspace-split grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="surface p-6 rounded-3xl border border-rule lg:col-span-2 space-y-4">
          <div className="section-heading flex items-center justify-between pb-2 border-b border-rule">
            <div>
              <span className="eyebrow font-bold text-xs">{dateLabel(day)}</span>
              <h2 className="text-xl font-bold text-ink mt-0.5">
                {inspector ? 'Customize Selected Meal' : 'Explore Therapeutic Recipes'}
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {allRecipes.length} recipes in library
            </span>
          </div>

          {inspector && (
            <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-rule space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-ink">{inspector.recipe.name}</h3>
                <span className="text-xs font-bold text-emerald-500">{inspector.slot.toUpperCase()}</span>
              </div>
              <p className="text-xs text-muted">{inspector.reason}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="field">
                  <span className="text-xs font-semibold">Servings</span>
                  <input
                    type="number"
                    min="0.25"
                    max="12"
                    step="0.25"
                    value={inspector.portions}
                    onChange={e => {
                      const n = Number(e.target.value);
                      if (n >= 0.25 && n <= 12) void edit(inspector.id, x => { x.portions = n; });
                    }}
                    className="form-input text-xs"
                  />
                </label>

                <label className="field">
                  <span className="text-xs font-semibold">Kcal / serving</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={inspector.nutritionOverride?.calories ?? inspector.recipe.nutrients.calories ?? ''}
                    onChange={e => {
                      const value = e.target.value;
                      void edit(inspector.id, x => {
                        x.nutritionOverride = { ...x.nutritionOverride, calories: value === '' ? null : Number(value) };
                      });
                    }}
                    className="form-input text-xs"
                  />
                </label>

                <label className="field">
                  <span className="text-xs font-semibold">Move to date</span>
                  <input
                    type="date"
                    min={plan?.startDate}
                    max={plan && addDays(plan.startDate, 29)}
                    value={inspector.date}
                    onChange={e => {
                      if (e.target.value >= start && e.target.value <= addDays(start, 29)) {
                        void edit(inspector.id, x => { x.date = e.target.value; });
                      }
                    }}
                    className="form-input text-xs"
                  />
                </label>

                <label className="field">
                  <span className="text-xs font-semibold">Slot</span>
                  <select
                    value={inspector.slot}
                    onChange={e => void edit(inspector.id, x => { x.slot = e.target.value as Slot; })}
                    className="form-select text-xs"
                  >
                    {['breakfast', 'lunch', 'dinner', 'snack'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-rule">
                <button
                  className="secondary-btn text-xs py-1.5 px-3 flex items-center gap-1.5"
                  onClick={() => void edit(inspector.id, e => { e.locked = !e.locked; })}
                >
                  {inspector.locked ? <Unlock size={14} /> : <LockKeyhole size={14} />}
                  <span>{inspector.locked ? 'Unlock' : 'Lock'}</span>
                </button>

                <button
                  className="secondary-btn text-xs py-1.5 px-3 flex items-center gap-1.5"
                  onClick={() => {
                    void update(s => {
                      s.preferenceEvents.push({ id: crypto.randomUUID(), recipeId: inspector.recipe.id, kind: 'favorite', at: new Date().toISOString() });
                    });
                    setMessage('Added to favorites.');
                  }}
                >
                  <Heart size={14} />
                  <span>Favorite</span>
                </button>

                <button
                  className="primary-btn text-xs py-1.5 px-3 flex items-center gap-1.5"
                  onClick={async () => {
                    if (
                      await update(s => {
                        s.diary.push({
                          id: crypto.randomUUID(),
                          date: day,
                          type: 'food',
                          name: inspector.recipe.name,
                          recipe: structuredClone(inspector.recipe),
                          calories: inspector.nutritionOverride?.calories,
                          portions: inspector.portions,
                          slot: inspector.slot,
                          at: new Date().toISOString()
                        });
                        s.preferenceEvents.push({ id: crypto.randomUUID(), recipeId: inspector.recipe.id, kind: 'eaten', at: new Date().toISOString() });
                      })
                    )
                      setMessage('Logged as eaten in your daily diary.');
                  }}
                >
                  <Check size={14} />
                  <span>Log as Eaten</span>
                </button>

                <button
                  className="text-xs text-red-500 hover:text-red-700 font-semibold px-2"
                  onClick={() => {
                    if (plan) void save({ ...plan, entries: plan.entries.filter(e => e.id !== inspector.id) });
                    setInspector(null);
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="flex gap-3">
            <input
              id="recipe-search"
              aria-label="Search recipes"
              placeholder="Search recipes, ingredients (e.g. Moong, Jowar, Sattu, Methi, Amla)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input flex-1 text-sm"
            />
            <select
              aria-label="Meal slot"
              value={slot}
              onChange={e => setSlot(e.target.value as Slot)}
              className="form-select w-32 text-xs"
            >
              {['breakfast', 'lunch', 'dinner', 'snack'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Recipe List with Clinical Benefit Badges */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {ranked.slice(0, 24).map(({ recipe: r, reason }) => {
              const isNafld = r.tags.includes('nafld-safe') || (r.nutrients.fiber && r.nutrients.fiber >= 5);
              const isLowGi = r.tags.includes('low-gi');
              const isProtein = r.nutrients.protein && r.nutrients.protein >= 15;
              const isB12 = r.tags.includes('b12-support');

              return (
                <button
                  key={r.id}
                  onClick={() => void add(r)}
                  className="w-full text-left p-3 rounded-2xl border border-rule bg-white dark:bg-black/30 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-ink truncate">{r.name}</strong>
                      <span className="text-[10px] text-muted shrink-0">{r.cuisine}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted mt-1">
                      <span>{r.nutrients.calories ? `${Math.round(r.nutrients.calories)} kcal` : 'Energy unknown'}</span>
                      <span>•</span>
                      <span>{r.nutrients.protein ? `${Math.round(r.nutrients.protein)}g Protein` : ''}</span>
                      <span>•</span>
                      <span>{r.nutrients.fiber ? `${Math.round(r.nutrients.fiber)}g Fiber` : ''}</span>
                      <span>•</span>
                      <span>{r.minutes} min</span>
                    </div>

                    {/* Clinical Badges */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {isNafld && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          🌿 NAFLD Safe
                        </span>
                      )}
                      {isLowGi && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          🩸 Low-GI Steady
                        </span>
                      )}
                      {isProtein && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          💪 15g+ Protein
                        </span>
                      )}
                      {isB12 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          ⚡ B12 Support
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowRight size={16} className="text-muted shrink-0" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Daily Nutrition & Grocery Sidebar */}
        <aside className="space-y-4">
          <section className="surface p-6 rounded-3xl border border-rule space-y-3">
            <span className="eyebrow font-bold text-xs uppercase">DAILY NUTRITION ESTIMATE</span>
            <h2 className="text-xl font-bold text-ink mt-0.5">Target Balance</h2>
            <p className="text-xs text-muted">{dateLabel(day)} · planned intake</p>

            <div className="space-y-2 pt-2">
              {Object.entries(nutrient).map(([k, v]) => (
                <div className="flex justify-between items-center text-xs py-1 border-b border-rule" key={k}>
                  <span className="capitalize text-muted">{k.replace('saturatedFat', 'Saturated fat')}</span>
                  <strong className="text-ink font-bold">
                    {!dayEntries.length ? '—' : v == null ? 'Incomplete' : `${Math.round(v)} ${k === 'calories' ? 'kcal' : k === 'sodium' ? 'mg' : 'g'}`}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          {grocery && (
            <section className="surface p-6 rounded-3xl border border-rule space-y-3">
              <h2 className="text-lg font-bold text-ink">This Week’s Grocery Needs</h2>
              <p className="text-xs text-muted">Estimated whole foods for 7 days</p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {groceryList((plan?.entries || []).filter(e => e.date >= day && e.date <= addDays(day, 6))).map(i => (
                  <div className="flex justify-between text-xs py-1 border-b border-rule" key={i.name}>
                    <span className="text-ink">{i.name}</span>
                    <strong className="text-muted">{Math.round(i.grams)} g</strong>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
