# Exercise & Physical Activity Burn Tracking Specifications for Weight Loss Web App

**Author / SME Role:** Fitness Coach & Exercise Physiologist SME  
**Target Application:** Health Planner Weight Loss Web App  

---

## 1. Activity Calorie Burn Calculations & MET Formulas

### 1.1 Mathematical Definition of MET (Metabolic Equivalent of Task)
1 MET is defined as the Resting Metabolic Rate (RMR)—the energy expended while sitting quietly at rest.
$$\text{1 MET} \equiv 3.5 \text{ mL } \text{O}_2 / \text{kg} / \text{min} \approx 1.0 \text{ kcal} / \text{kg} / \text{hour}$$

---

### 1.2 Gross vs. Net Calorie Burn Calculations

In weight loss tracking, distinguishing between **Gross** and **Net** calorie burn is critical:
* **Gross Calories**: Total energy expended during exercise, including baseline metabolism.
* **Net Calories**: Additional energy burned strictly due to physical activity above resting levels.  
  *Coaching Recommendation for Web App Engine:* **Use Net Calories when integrating exercise into daily TDEE allowance** to prevent double-counting BMR calories during exercise windows.

#### Gross Calorie Burn Formula
$$\text{Calories}_{\text{gross}} (\text{kcal}) = \text{MET} \times \text{Body Weight (kg)} \times \left( \frac{\text{Duration (minutes)}}{60} \right)$$

*Oxygen-Consumption Variant (Exact Standard):*
$$\text{Calories}_{\text{gross}} (\text{kcal}) = \left( \frac{\text{MET} \times 3.5 \times \text{Body Weight (kg)}}{200} \right) \times \text{Duration (minutes)}$$

#### Net Calorie Burn Formula (Recommended for TDEE Budgeting)
$$\text{Calories}_{\text{net}} (\text{kcal}) = (\text{MET} - 1.0) \times \text{Body Weight (kg)} \times \left( \frac{\text{Duration (minutes)}}{60} \right)$$

---

### 1.3 Corrected MET Formula (Individualized Adjustments)
Standard MET assumes a baseline oxygen uptake of $3.5 \text{ mL/kg/min}$ (typical for a young, average-weight male). For higher precision in individuals with higher body fat % or older age, the app should adjust MET using actual RMR estimated via the **Mifflin-St Jeor Formula**:

$$\text{BMR}_{\text{Mifflin-St Jeor}} = (10 \times \text{Weight}_{\text{kg}}) + (6.25 \times \text{Height}_{\text{cm}}) - (5 \times \text{Age}_{\text{yrs}}) + s$$
*(where $s = +5$ for males, $-161$ for females)*

$$\text{RMR}_{\text{actual}} (\text{mL/kg/min}) = \frac{\text{BMR}_{\text{daily}}}{24 \times \text{Weight}_{\text{kg}} \times 0.0175 \times 60}$$

$$\text{Corrected MET} = \text{MET}_{\text{standard}} \times \left( \frac{3.5}{\text{RMR}_{\text{actual}}} \right)$$

---

## 2. Master MET Table: Common & Indian-Specific Activities

Below is the standard MET reference table curated for common activities and Indian lifestyle habits (derived from the *Compendium of Physical Activities*):

| Activity Category | Specific Activity / Variation | Compendium Code | Standard MET | Intensity Level | Est. Burn (70kg, 30 min: Gross / Net) |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **Brisk Walking** | Slow Casual Walking (3.2 km/h) | `17150` | 2.8 | Light | 98 kcal / 63 kcal |
| | Moderate Pace Walking (4.8 km/h) | `17170` | 3.5 | Moderate | 123 kcal / 88 kcal |
| | Brisk Walking (5.6 – 6.4 km/h) | `17190` | 4.3 – 5.0 | Moderate | 151 – 175 kcal / 116 – 140 kcal |
| | Very Brisk / Race Walking (>7 km/h) | `17220` | 6.5 – 8.0 | Vigorous | 228 – 280 kcal / 193 – 245 kcal |
| **Running** | Slow Jogging (7.5 km/h) | `12020` | 7.0 | Moderate/Vigorous | 245 kcal / 210 kcal |
| | Running Moderate Pace (9.6 km/h / 6 mph) | `12050` | 9.8 | Vigorous | 343 kcal / 308 kcal |
| | Fast Running (12 km/h / 7.5 mph) | `12080` | 11.5 | Vigorous | 403 kcal / 368 kcal |
| | High-Speed Interval / Sprinting (>16 km/h) | `12130` | 14.5 – 16.0 | Extreme | 508 – 560 kcal / 473 – 525 kcal |
| **Cycling** | Leisure Cycling (<15 km/h) | `01010` | 4.0 | Light/Moderate | 140 kcal / 105 kcal |
| | Moderate Cycling (16–19 km/h) | `01020` | 6.8 | Moderate | 238 kcal / 203 kcal |
| | Vigorous Cycling / Spin Class (20–25 km/h) | `01030` | 8.5 – 10.0 | Vigorous | 298 – 350 kcal / 263 – 315 kcal |
| **Gym & Weights** | Light Weight Training / Machines | `02050` | 3.5 | Light | 123 kcal / 88 kcal |
| | Moderate Circuit Training / Heavy Free Weights | `02040` | 5.0 | Moderate | 175 kcal / 140 kcal |
| | Vigorous Powerlifting / Bodybuilding minimal rest | `02052` | 6.0 – 8.0 | Vigorous | 210 – 280 kcal / 175 – 245 kcal |
| **Yoga** | Restorative / Hatha Yoga | `02150` | 2.5 – 3.0 | Light | 88 – 105 kcal / 53 – 70 kcal |
| | Power / Vinyasa Yoga | `02152` | 4.0 | Moderate | 140 kcal / 105 kcal |
| | **Surya Namaskar (Slow/Mindful, 4–6 rounds/10m)** | `Custom/02150` | 3.3 | Light/Moderate | 116 kcal / 81 kcal |
| | **Surya Namaskar (Brisk/Continuous, 12–24 rounds/10m)** | `Custom/02153` | 5.5 – 7.4 | Vigorous | 193 – 259 kcal / 158 – 224 kcal |
| **Household Chores** | Sweeping floors with traditional broom (Jharu) | `05040` | 3.3 | Light/Moderate | 116 kcal / 81 kcal |
| | Mopping floors standing/bent (Pocha) | `05020` | 2.5 – 3.5 | Light/Moderate | 88 – 123 kcal / 53 – 88 kcal |
| | Mopping floors scrubbing on knees | `05030` | 4.8 | Moderate | 168 kcal / 133 kcal |
| | Hand washing clothes (Kapde dhona) | `05090` | 4.0 | Moderate | 140 kcal / 105 kcal |
| | Washing dishes standing by hand | `05060` | 2.3 | Light | 81 kcal / 46 kcal |
| **Sports** | **Cricket (General Match Play - Batting/Fielding)** | `15150` | 4.8 | Moderate | 168 kcal / 133 kcal |
| | **Cricket (Fast Bowling session / Drills)** | `15152` | 6.5 | Vigorous | 228 kcal / 193 kcal |
| | **Cricket (Casual Gully Cricket)** | `15154` | 3.8 | Light/Moderate | 133 kcal / 98 kcal |
| | **Badminton (Casual / Social Play)** | `15040` | 4.5 – 5.5 | Moderate | 158 – 193 kcal / 123 – 158 kcal |
| | **Badminton (Competitive Match Play)** | `15050` | 7.0 – 9.0 | Vigorous | 245 – 315 kcal / 210 – 280 kcal |

---

## 3. Daily Active Energy Expenditure (EAEE) Recommendations

Total Daily Energy Expenditure (TDEE) is divided as:
$$\text{TDEE} = \text{BMR} + \text{TEF (10\%)} + \text{NEAT} + \text{EAT}$$
Where:
* **NEAT (Non-Exercise Activity Thermogenesis)** = Walking, standing, sweeping, chores.
* **EAT (Exercise Activity Thermogenesis)** = Structured workouts, sports, running, gym.
* **EAEE (Exercise & Active Energy Expenditure)** = $\text{NEAT} + \text{EAT}$.

### Lifestyle Activity Factors (PAL Coefficient & Target Active Burn)

1. **Sedentary (PAL = 1.2)**
   * *Profile:* Desk job, sitting most of the day, <3,000 steps/day.
   * *Target Daily Active Burn (EAEE):* **150 – 250 kcal/day**
   * *Strategy:* Focus on reaching 5,000 steps + 20 min light walking/stretching.

2. **Lightly Active (PAL = 1.375)**
   * *Profile:* Standing desk / light household work, 5,000 – 7,500 steps/day.
   * *Target Daily Active Burn (EAEE):* **300 – 450 kcal/day**
   * *Strategy:* 30 min moderate activity (Brisk walking, Surya Namaskar, household chores).

3. **Moderately Active (PAL = 1.55)**
   * *Profile:* Active job / daily walking, 8,000 – 11,000 steps/day + 30–45 min exercise.
   * *Target Daily Active Burn (EAEE):* **500 – 700 kcal/day**
   * *Strategy:* 45 min structured workout (Gym weight training, Badminton, Running).

4. **Very Active (PAL = 1.725+)**
   * *Profile:* Heavy physical labor / sports training, >12,000 steps/day.
   * *Target Daily Active Burn (EAEE):* **750 – 1000+ kcal/day**

---

## 4. Adaptive Caloric Burn Targets Based on Weight Loss Speed

### 4.1 Fat Loss Energy Deficit Math
* **$1 \text{ kg body fat} \approx 7,700 \text{ kcal}$**
* **$1 \text{ lb body fat} \approx 3,500 \text{ kcal}$**

### 4.2 Weekly Deficit Breakdown by Target Rate

| Target Loss Speed | Total Weekly Deficit Required | Required Daily Caloric Deficit | Recommended Split (60% Diet / 40% Exercise) | Recommended Split (70% Diet / 30% Exercise) |
| :--- | :---: | :---: | :---: | :---: |
| **0.5 kg / week** (Moderate) | $3,850 \text{ kcal}$ | **$550 \text{ kcal/day}$** | Diet Cut: $-330 \text{ kcal}$<br>Exercise Burn: $+220 \text{ kcal}$ | Diet Cut: $-385 \text{ kcal}$<br>Exercise Burn: $+165 \text{ kcal}$ |
| **0.75 kg / week** (Aggressive) | $5,775 \text{ kcal}$ | **$825 \text{ kcal/day}$** | Diet Cut: $-495 \text{ kcal}$<br>Exercise Burn: $+330 \text{ kcal}$ | Diet Cut: $-577.5 \text{ kcal}$<br>Exercise Burn: $+247.5 \text{ kcal}$ |
| **1.0 kg / week** (Max Safe Rate) | $7,700 \text{ kcal}$ | **$1,100 \text{ kcal/day}$** | Diet Cut: $-660 \text{ kcal}$<br>Exercise Burn: $+440 \text{ kcal}$ | Diet Cut: $-770 \text{ kcal}$<br>Exercise Burn: $+330 \text{ kcal}$ |

---

### 4.3 Fitness Coaching & Safety Logic

1. **Dietary Floor Limits (Hard Safety Rule):**
   * Caloric intake must NOT drop below **1,200 kcal/day for females** and **1,500 kcal/day for males**.
   * If the user's TDEE is low and an aggressive rate (e.g. 1 kg/week) pushes diet below floor limits, the engine must automatically cap dietary cut at the floor and transfer the remaining deficit to the **Active Exercise Burn target**.

2. **Pace Capping Rule:**
   * Weight loss should not exceed **1.0% of total body weight per week** to prevent lean muscle loss, gallstone formation, and hormonal down-regulation.

3. **Adaptive Feedback Loop & Plateau Detection Engine:**
   * **Stall Trigger:** If user weight fluctuates $< 0.2 \text{ kg}$ over a 14-day rolling window:
     1. *Recalculate TDEE:* Update BMR with the user's latest lower weight.
     2. *Check NEAT Fatigue:* Detect if step count dropped naturally due to diet fatigue.
     3. *Dynamic Adjustment:* Increment daily active exercise target by $+50 – 100 \text{ kcal}$ or adjust dietary intake by $-50 – 100 \text{ kcal}$.
     4. *Refeed Recommendation:* Suggest a 1-day energy maintenance refeed (at TDEE level) to restore leptin and thyroid function.

---

## 5. Software Data Model & Pseudocode Specification

### JSON Data Model Schema for Activity Logging
```json
{
  "activityId": "act_yoga_surya_namaskar_brisk",
  "activityName": "Surya Namaskar (Brisk)",
  "category": "Yoga",
  "compendiumCode": "02153",
  "metValue": 6.0,
  "intensity": "Vigorous",
  "userWeightKg": 70.0,
  "durationMinutes": 30,
  "calculatedGrossCalories": 210.0,
  "calculatedNetCalories": 175.0,
  "timestamp": "2026-09-15T08:30:00+05:30"
}
```

### Calorie Engine Algorithm (Pseudocode)
```typescript
function calculateNetExerciseBurn(
  met: number,
  weightKg: number,
  durationMinutes: number
): number {
  const durationHours = durationMinutes / 60;
  const netMet = Math.max(0, met - 1.0);
  return Math.round(netMet * weightKg * durationHours);
}

function calculateTargetBurnSplit(
  weeklyTargetKg: number, 
  userTdee: number, 
  userBmr: number, 
  gender: 'male' | 'female'
): { dailyDietCut: number; dailyExerciseBurn: number } {
  const totalDailyDeficit = (weeklyTargetKg * 7700) / 7;
  
  // Default 60/40 Split
  let dietCut = totalDailyDeficit * 0.60;
  let exerciseBurn = totalDailyDeficit * 0.40;
  
  const minimumIntakeFloor = gender === 'female' ? 1200 : 1500;
  const projectedIntake = userTdee - dietCut;
  
  // Enforce safety floor
  if (projectedIntake < minimumIntakeFloor) {
    dietCut = userTdee - minimumIntakeFloor;
    exerciseBurn = totalDailyDeficit - dietCut;
  }
  
  return {
    dailyDietCut: Math.round(dietCut),
    dailyExerciseBurn: Math.round(exerciseBurn)
  };
}
```

This completes the comprehensive fitness SME specification for exercise and activity burn tracking.
