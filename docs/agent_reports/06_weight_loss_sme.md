# Weight Loss Domain & Gamification SME Specifications

---

## 1. Calorie Deficit Engine Specifications & Safety Guardrails

### 1.1 Core Safety Rules & Guardrails
- **Minimum Daily Calorie Intake Floor (Hard Limit)**:
  - **Females**: Minimum **1,200 kcal/day**.
  - **Males**: Minimum **1,500 kcal/day**.
  - *Safety Rationale*: Intakes below these thresholds drastically increase risk of nutrient deficiencies (micro-nutrients, essential fatty acids), gallstone formation, lean muscle loss, and severe metabolic slowing.
  - *Engine Behavior*: If calculated target intake falls below the gender-specific minimum floor, the engine automatically clamps `Target_Intake = Minimum_Floor` and issues a safety advisory banner explaining why the pace has been moderated.

- **Safe Daily Calorie Deficit Range**:
  - **Mild Deficit**: 250 kcal/day (~0.25 kg weight loss / week)
  - **Moderate Deficit (Recommended)**: 500 kcal/day (~0.50 kg weight loss / week)
  - **Maximum Safe Deficit**: 750 kcal/day (~0.75 kg weight loss / week)
  - **Cap Standard**: Daily deficit should **never exceed 20–25% of TDEE** or **1% of current body weight per week** (whichever is lower).

- **Dynamic Safety Alerts & Over-Restriction Flags**:
  - **Vigor Warning Trigger**: If user logs net calories $< \text{BMR}$ for 3 consecutive days, trigger a *Metabolic Protection Prompt* encouraging intake of nutrient-dense whole foods.
  - **Starvation Mode Mitigation**: Prevent users from setting manual daily targets lower than their BMR without medical clearance flag.

### 1.2 Macronutrient & Fiber Allocation Guidelines
- **Protein**: $1.6 - 2.2 \text{ g/kg body weight}$ (25–35% of daily calories) to preserve lean body mass during deficit.
- **Carbohydrates**: 45–55% of daily calories (focused on complex carbs, low glycemic index foods).
- **Fats**: 20–30% of daily calories (minimum 0.6–0.8 g/kg to maintain hormonal health).
- **Dietary Fiber**: Minimum **25g/day for women**, **38g/day for men** (or 14g per 1,000 kcal).

---

## 2. Weight Loss Gamification Mechanics

### 2.1 Calorie Negative Streaks
- **Streak Rule**: A day counts as a successful "Streak Day" if the user's net logged calories fall within the **Target Deficit Window** (Target Deficit $\pm 100 \text{ kcal}$).
- **Streak Multiplier**:
  - Days 1–3: $1.0\times$ XP multiplier
  - Days 4–7: $1.25\times$ XP multiplier
  - Days 8–14: $1.5\times$ XP multiplier
  - Days 15+: $2.0\times$ XP multiplier (Max Cap)
- **Streak Loss Prevention**: Missing a single day resets streak to 0 unless a **Calorie Shield** is active.

### 2.2 Deficit XP & Leveling System
- **XP Generation Actions**:
  | Action | Base XP | Daily Cap |
  | :--- | :--- | :--- |
  | Logging all 3 main meals (Breakfast, Lunch, Dinner) | +50 XP | 50 XP |
  | Hitting Net Calorie Deficit Target ($\pm 100$ kcal) | +100 XP | 100 XP |
  | Logging Workout / Exercise ($>200$ kcal burned) | +50 XP | 100 XP |
  | Hitting Daily Water Intake Goal | +30 XP | 30 XP |
  | Logging Weight Entry | +20 XP | 20 XP |
  | Maintaining Streak (Bonus = $Day\_Count \times 10$) | Up to +150 XP | 150 XP |

- **XP Formula & Level Progression**:
  $$XP_{required}(Level) = 100 \times Level^{1.5}$$

  | Level Range | Tier Title | Perks / Unlocks |
  | :--- | :--- | :--- |
  | Level 1 – 4 | **Beginner Planner** | Basic Tracking, BMI/BMR Dashboard |
  | Level 5 – 9 | **Deficit Apprentice** | Unlocks Calorie Shield Slot, Water Tracker Badges |
  | Level 10 – 14 | **Macro Navigator** | Unlocks Boss Fights, Advanced Macro Breakdown |
  | Level 15 – 19 | **Fitness Strategist** | Unlocks Custom Meal Templates, 2x Shield Capacity |
  | Level 20+ | **Calorie Master** | Gold Profile Ring, Custom Title, Master Leaderboard |

### 2.3 Calorie Shield / Freeze Item
- **Purpose**: Protects active streak on social days, weddings, cheat days, or travel when maintaining a deficit is unfeasible.
- **Mechanics**:
  - When active, if net daily intake exceeds target calorie limit or logging is missed, the streak counter does **NOT** reset to zero.
  - Does not reward XP for the frozen day, but preserves streak multiplier.
- **Acquisition & Cap Rules**:
  - Earned automatically every **7-day streak completion** (Max inventory cap: 2 Shields).
  - Can be purchased with in-app reward points (Gems/Health Points).
  - **Cooldown**: Max **1 Shield usable per 7-day rolling window** (prevents abuse/streak trivialization).

### 2.4 Achievement Badges Matrix
1. **Hydration Hero**: Log $\ge 3.0 \text{ Liters}$ of water per day for 7 consecutive days.
2. **Indian Diet Explorer**: Log 20 unique high-protein or balanced traditional Indian food items (e.g., Moong Dal Chilla, Paneer Tikka, Rajma-Chawal, Sprouts Chaat, Sambar Idli, Tofu Bhurji).
3. **7-Day Streak Master**: Maintain target calorie deficit for 7 consecutive days.
4. **5kg Milestone**: Log a verified net loss of 5.0 kg from starting body weight.
5. **Macro Maestro**: Hit Macro Targets (Protein/Carb/Fat within $\pm 5\%$) for 5 days in a row.
6. **Boss Slayer**: Defeat the weekly "Calorie Surplus Monster".

### 2.5 Boss Fights: "Calorie Surplus Monster" (Weekly Deficit Challenge)
- **Boss Concept**: A weekly community or solo boss representing accumulated surplus calories.
- **Boss Health Points (HP)**:
  $$Boss\_HP = Daily\_Target\_Deficit \times 7 \text{ days}$$
  *(e.g., 500 kcal target deficit/day = 3,500 Boss HP)*.
- **Combat Mechanics**:
  - Every daily calorie deficit achieved acts as a direct attack on the Boss (e.g., 550 kcal deficit achieved on Monday = 550 damage dealt).
  - If daily intake is in surplus, the Boss recovers HP equal to the surplus amount.
- **Victory Condition**: Reduce Boss HP to 0 by Sunday 23:59.
- **Boss Loot**:
  - +500 Bonus XP
  - 1x Calorie Shield
  - Legendary "Surplus Slayer" Profile Badge.

---

## 3. Weight Loss Calculators & Mathematical Formulas

### 3.1 Body Mass Index (BMI)
- **Formula**:
  $$BMI = \frac{Weight\_kg}{(Height\_m)^2}$$
- **Classification Standards (WHO vs. Asian / Indian Specific)**:
  | Category | International Standard (WHO) | Asian / Indian Standard (ICMR) |
  | :--- | :--- | :--- |
  | Underweight | $< 18.5$ | $< 18.5$ |
  | Normal Weight | $18.5 - 24.9$ | $18.5 - 22.9$ |
  | Overweight | $25.0 - 29.9$ | $23.0 - 24.9$ |
  | Obese | $\ge 30.0$ | $\ge 25.0$ |

### 3.2 Basal Metabolic Rate (BMR) - Mifflin-St Jeor Formula
- **Males**:
  $$BMR = (10 \times Weight\_kg) + (6.25 \times Height\_cm) - (5 \times Age\_years) + 5$$
- **Females**:
  $$BMR = (10 \times Weight\_kg) + (6.25 \times Height\_cm) - (5 \times Age\_years) - 161$$

### 3.3 Total Daily Energy Expenditure (TDEE)
- **Formula**:
  $$TDEE = BMR \times Physical\_Activity\_Multiplier$$
- **Activity Level Multipliers**:
  - **Sedentary** (desk job, little/no exercise): $1.200$
  - **Lightly Active** (light exercise 1–3 days/week): $1.375$
  - **Moderately Active** (moderate exercise 3–5 days/week): $1.550$
  - **Very Active** (hard exercise 6–7 days/week): $1.725$
  - **Extra Active** (intense daily physical labor/athletics): $1.900$

### 3.4 Calorie Deficit Target Calculator
- **Target Daily Intake Formula**:
  $$Target\_Intake = \max \left( TDEE - Selected\_Deficit, Minimum\_Floor \right)$$
  where:
  - $Selected\_Deficit \in \{250, 500, 750\} \text{ kcal/day}$
  - $Minimum\_Floor = 1200 \text{ (Female)} \text{ or } 1500 \text{ (Male)}$

### 3.5 Target Date Estimator (Weight Goal vs. Deficit)
- **Caloric Equivalent of Body Weight**:
  $$1 \text{ kg fat mass} \approx 7,700 \text{ kcal}$$
- **Total Deficit Required**:
  $$\Delta W = Current\_Weight\_kg - Target\_Weight\_kg$$
  $$Total\_Deficit\_Needed = \Delta W \times 7,700 \text{ kcal}$$
- **Base Timeline (Days)**:
  $$Days\_Base = \frac{Total\_Deficit\_Needed}{Daily\_Deficit\_kcal}$$
- **Adaptive Thermogenesis Adjustment Factor**:
  As weight decreases, BMR declines by approx. 5–10% per 5kg lost due to metabolic adaptation.
  $$Days\_Adjusted = Days\_Base \times \left(1 + 0.05 \times \lfloor \frac{\Delta W}{5} \rfloor \right)$$
- **Estimated Target Date**:
  $$Target\_Date = Current\_Date + Days\_Adjusted$$

---

## 4. Behavioral Psychology & Retention Loops

### 4.1 Habit Formation Loop (The Hook Model)
1. **Trigger**:
   - *Internal*: Feeling post-meal guilt or desire for health transformation.
   - *External*: Push notifications at scheduled meal times ("Time to log lunch & earn +50 XP!").
2. **Action**: Simple 2-tap food/water logging interface.
3. **Variable Reward**: Dynamic XP gain, streak level increment, random unlock of healthy recipe card or badge progression.
4. **Investment**: Accumulating non-transferable progress (Level status, historical streak records, unlocked badges, custom meal logs).

### 4.2 Loss Aversion & Commitment Contracts
- **Streak Preservation Psychology**: People experience twice as much pain from losing something as pleasure from gaining it. Displaying "Fire Streaks" creates strong loss aversion.
- **Calorie Shields**: Prevent total demotivation when a user strays off plan. Without shields, a broken streak often triggers the *Abstinence Violation Effect* ("I broke my diet today, so I might as well overeat all weekend").
- **Commitment Contracts**: Prompting users at the start of each week to commit to their weekly boss challenge.

### 4.3 Self-Determination Theory (SDT) Framework
- **Autonomy**: Providing flexibility in choosing target deficit (Mild/Moderate/Aggressive) and meal options rather than enforcing rigid diets.
- **Competence**: Breaking 10kg+ weight loss into 0.5kg micro-milestones and daily XP rewards to build self-efficacy.
- **Relatedness**: Defeating Boss Monsters alongside weekly challenges, leaderboard comparisons, and badge sharing.

---

This detailed specification provides exact mathematical formulas, safety limits, gamification mechanisms, and behavioral psychology principles ready for web app implementation.
