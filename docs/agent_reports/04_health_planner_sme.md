# Comprehensive Domain Specifications for Daily Health Planning in Weight Loss Web Application

## Executive Summary
This specification defines the clinical, mathematical, and behavioral requirements for an evidence-based daily health planning system within a weight loss web application. The specifications are divided into four main pillars: Core Daily Metrics, Daily Planning Workflow, Weekly & Monthly Reflection & Analytics, and User Readiness & Engagement Features.

---

## 1. Core Daily Health Planning Metrics

### 1.1 Calorie Intake Targets

#### A. Basal Metabolic Rate (BMR) Formulation
The application MUST utilize the **Mifflin-St Jeor Equation**, recognized as the gold standard for predicting BMR in non-critically ill adults with highest clinical accuracy ($\pm 10\%$ of measured indirect calorimetry).

* **Males:**
  $$\text{BMR (kcal/day)} = (10 \times W) + (6.25 \times H) - (5 \times A) + 5$$

* **Females:**
  $$\text{BMR (kcal/day)} = (10 \times W) + (6.25 \times H) - (5 \times A) - 161$$

*(Where $W$ = weight in kg, $H$ = height in cm, $A$ = age in years)*

#### B. Total Daily Energy Expenditure (TDEE) Calculation
TDEE factors in Physical Activity Level (PAL) multipliers applied to BMR:

$$\text{TDEE} = \text{BMR} \times \text{PAL}$$

| Activity Level Category | PAL Multiplier | Clinical / Behavioral Definition |
| :--- | :--- | :--- |
| **Sedentary** | 1.200 | Desk job, minimal walking, no formal exercise |
| **Lightly Active** | 1.375 | Light exercise/sports 1–3 days/week or moderate daily walking (~5,000–7,499 steps) |
| **Moderately Active** | 1.550 | Moderate exercise/sports 3–5 days/week (~7,500–9,999 steps) |
| **Very Active** | 1.725 | Hard exercise/sports 6–7 days/week (~10,000–12,500 steps) |
| **Extra Active** | 1.900 | Very hard daily exercise/sports & physical job or double training sessions |

#### C. Weight Loss Caloric Deficit Logic
Fat loss requires a controlled negative energy balance. $1\text{ kg of adipose tissue} \approx 7,700\text{ kcal}$ ($1\text{ lb} \approx 3,500\text{ kcal}$).

| Target Loss Rate | Daily Deficit | Target Deficit Range | Ideal Target Audience |
| :--- | :--- | :--- | :--- |
| **Mild Loss** (0.25 kg / ~0.5 lb per week) | $-275\text{ kcal/day}$ | $250 - 300\text{ kcal}$ | Low BMI (<23), muscle preservation focus, sensitive to hunger |
| **Moderate Loss** (0.50 kg / ~1.0 lb per week) | $-550\text{ kcal/day}$ | $500 - 600\text{ kcal}$ | Standard recommendation for most users |
| **Aggressive Loss** (0.75 kg / ~1.5 lb per week)| $-825\text{ kcal/day}$ | $800 - 850\text{ kcal}$ | Higher starting BMI ($\ge 27\text{ kg/m}^2$), short-term focus |
| **Maximum Safe** (1.00 kg / ~2.0 lb per week) | $-1,100\text{ kcal/day}$| $1,000 - 1,100\text{ kcal}$| Obese class I+ ($\text{BMI} \ge 30\text{ kg/m}^2$), under clinical supervision |

#### D. Clinical Safety Floor Rules
To mitigate risk of micronutrient deficiencies, metabolic adaptation, gallstone formation, and muscle mass degradation, hard daily caloric lower bounds MUST be enforced:
* **Female Safety Floor:** Absolute minimum $1,200\text{ kcal/day}$
* **Male Safety Floor:** Absolute minimum $1,500\text{ kcal/day}$
* **Deficit Cap:** Daily deficit must NOT exceed $30\%$ of TDEE regardless of target loss rate selected.

#### E. Dynamic TDEE & Target Recalculation
* **Trigger Conditions:** Auto-prompt target recalculation every **$3\text{ kg}$ to $5\text{ kg}$ weight loss** or every **30 days**.
* **Clinical Rationale:** As body weight decreases, metabolic cost of self-transport and BMR drop. Unadjusted calorie targets lead to artificial plateaus.

---

### 1.2 Water Hydration Tracking

#### A. Hydration Target Formulas
* **Base Requirement:**
  $$\text{Base Fluid (mL)} = \text{Body Weight (kg)} \times 35\text{ mL/kg}$$
  *(e.g., $70\text{ kg} \times 35\text{ mL} = 2,450\text{ mL/day}$)*
* **Exercise Adjustments:**
  $$\text{Exercise Fluid Addition} = +350\text{ mL to } 500\text{ mL per 30 minutes of moderate-to-vigorous exercise}$$
* **Climate Adjustments:**
  Add $+250\text{ mL to } 500\text{ mL}$ for hot/humid ambient temperatures (>30°C / >86°F).

#### B. Standard Tracking UI Increments
* **Preset Quick-Log Options:** $250\text{ mL}$ (1 glass), $330\text{ mL}$ (can), $500\text{ mL}$ (standard bottle), $750\text{ mL}$ (sports bottle).
* **Custom Entry:** Numeric entry with oz/mL toggle.

#### C. Clinical Rationale
1. **Lipolysis Efficiency:** Triglyceride hydrolysis requires water molecules ($\text{Triglyceride} + 3\text{H}_2\text{O} \xrightarrow{\text{Lipase}} \text{Glycerol} + 3\text{Fatty Acids}$). Mild dehydration slows lipolytic throughput.
2. **Appetite Regulation:** Thirst signals mediated by osmoreceptors can mimic mild hunger sensation. Pre-meal hydration ($500\text{ mL}$ 30 min prior to meals) decreases acute meal energy intake by $13\%$.
3. **Fluid Balance & Weight Noise Reduction:** Consistent hydration prevents aldosterone-driven sodium and water retention.

---

### 1.3 Sleep Tracking & Circadian Health

#### A. Key Quantitative Metrics
* **Target Duration:** $7.0\text{ to } 9.0\text{ hours/night}$ for adults.
* **Sleep Efficiency:**
  $$\text{Sleep Efficiency (\%)} = \left( \frac{\text{Total Sleep Time}}{\text{Total Time in Bed}} \right) \times 100 \quad (\text{Target: } \ge 85\%)$$
* **Sleep Schedule Consistency:** Variance in bedtime/wake-up time within $\pm 30\text{ minutes}$.

#### B. Impact on Weight Loss Physiology
* **Hormonal Regulation:**
  * **Ghrelin:** Sleep restriction (<6 hours/night) increases circulating ghrelin by up to $28\%$, elevating hunger and cravings for energy-dense, hyper-palatable carbohydrates.
  * **Leptin:** Decreases circulating leptin by up to $18\%$, suppressing satiety signaling.
  * **Cortisol:** Chronically elevated evening cortisol impairs insulin sensitivity and promotes visceral adiposity accumulation.
* **Substrate Utilization & NEAT:** Sleep deprivation reduces Non-Exercise Activity Thermogenesis (NEAT) and impairs impulse control via reduced prefrontal cortex executive functioning.

---

### 1.4 Macronutrient & Fiber Targets

#### A. Macronutrient Allocation Models

##### Model 1: High-Protein Weight Loss (Gold Standard for Muscle Retention)
1. **Protein Target:** Set relative to body mass: $1.6\text{ to } 2.2\text{ g/kg total weight}$ (or $2.0\text{ to } 2.4\text{ g/kg LBM}$).
2. **Dietary Fat Target:** Set to $20\text{–}30\%$ of total daily calories (minimum $0.6\text{ to } 0.8\text{ g/kg}$ to preserve steroid hormone synthesis).
3. **Carbohydrate Target:** Remaining daily calories allocated to carbohydrates.

##### Model 2: Percentage-Based Macro Distribution
* **Protein:** $30\%$ of total calories
* **Carbohydrates:** $40\%$ of total calories
* **Fats:** $30\%$ of total calories

#### B. Fiber Allocation Targets
* **Formula:** $14\text{ g fiber per } 1,000\text{ kcal consumed}$
* **Minimum Baselines:**
  * Females: Minimum $25\text{ g/day}$
  * Males: Minimum $38\text{ g/day}$
* **Clinical Impact:** Gut microbiome fermentation of soluble fiber produces Short-Chain Fatty Acids (SCFAs: acetate, propionate, butyrate) which stimulate GLP-1 and PYY peptide release, promoting satiety and delaying gastric emptying.

#### C. Thermic Effect of Food (TEF) & Satiety Matrix
* **Protein TEF:** $20\text{–}30\%$ of energy consumed is expended in metabolism.
* **Carbohydrates TEF:** $5\text{–}10\%$ of energy.
* **Fats TEF:** $0\text{–}3\%$ of energy.

---

## 2. Daily Planning Workflow Specification

```
┌────────────────────────────────────────────────────────┐
│                   MORNING ROUTINE                      │
│ - Fasted weigh-in protocol                             │
│ - Review calorie & macro targets                       │
│ - Pre-log planned meals & hydration intention           │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                    MEAL LOGGING                        │
│ - Breakfast (25%)  │  Lunch (35%)                      │
│ - Dinner (30%)     │  Snacks (10%)                     │
│ - Visual portion estimation & macro ring feedback      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   EVENING REVIEW                       │
│ - Calorie/macro compliance audit (±5-10% band)         │
│ - Non-Scale Victories (NSVs): Energy, Hunger, Stress   │
│ - Qualitative reflection & next-day plan               │
└──────────────────────────┬─────────────────────────────┘
```

### 2.1 Morning Planning Routine
1. **Fasted Morning Weigh-In Protocol:**
   * Measure upon waking, after bladder evacuation, before food or fluid intake, wearing minimal clothing, on a level calibrated digital scale.
2. **Target Overview Dashboard:**
   * Display dynamic calorie goal, macro target breakdown, and baseline water requirement.
3. **Pre-Logging Intentionality:**
   * Enable users to map out their meal structure for the day ahead. Pre-logging reduces evening decision fatigue and impulse eating.

---

### 2.2 Meal Logging Architecture

#### A. Calorie Allocation across Meal Slots
Default target distribution (user-customizable):
* **Breakfast:** $25\%$ of daily calories
* **Lunch:** $35\%$ of daily calories
* **Dinner:** $30\%$ of daily calories
* **Snacks:** $10\%$ of daily calories

#### B. Input Capabilities & Food Database Features
* Verified food database (USDA / Branded databases) with verified nutrition tags.
* Barcode scanner integration for packaged foods.
* Recipe Builder with auto-apportioned portion serving metrics.
* Quick-add calories and macronutrient entry.

#### C. Visual Portion Estimation Hand Guide
For users without digital kitchen scales:
* **Palm of hand:** $\approx 1\text{ serving protein}$ ($20\text{–}30\text{ g}$)
* **Fist size:** $\approx 1\text{ cup vegetables / complex carbs}$
* **Cupped hand:** $\approx \frac{1}{2}\text{ cup dense carbs/grains}$
* **Thumb tip:** $\approx 1\text{ tbsp fats/oils}$ ($14\text{ g}$)

---

### 2.3 Evening Review & Non-Scale Victories (NSV)

#### A. Daily Compliance Scoring
* **Calorie Adherence Window:** Hitting target within $\pm 5\%\text{ to }\pm 10\%$ is scored as **$100\%$ Compliant** (preventing perfectionist all-or-nothing mindset).
* **Macro Adherence Band:** Protein within $\pm 10\%$, Carbs/Fats within $\pm 15\%$.

#### B. Non-Scale Victories (NSV) Tracking Matrix (1–5 Likert Scale)
1. **Energy Level:** 1 (Exhausted) to 5 (Vibrant/Energetic)
2. **Hunger / Satiety Control:** 1 (Extreme hunger/binge urge) to 5 (Comfortably satisfied)
3. **Stress Level:** 1 (Severe stress) to 5 (Calm/Managed)
4. **Digestive Comfort:** 1 (Bloated/Constipated) to 5 (Optimal digestion)

#### C. Qualitative Evening Reflection
* Short structured prompt: *"What went well today? What will you tweak tomorrow?"*

---

## 3. Weekly & Monthly Reflection & Analytics

### 3.1 Weight Fluctuation Smoothing (7-Day Moving Average - 7DMA)

#### A. Mathematical Formulation
To eliminate noise from transient fluid retention, daily weight $W_t$ MUST be smoothed using a **7-Day Moving Average (7DMA)**:

$$\text{7DMA}_t = \frac{1}{7} \sum_{i=0}^{6} W_{t-i}$$

Alternatively, an **Exponential Moving Average (EMA)** can be used for higher weighting of recent entries:

$$\text{EMA}_t = (W_t \times \alpha) + (\text{EMA}_{t-1} \times (1 - \alpha)) \quad \text{where } \alpha = \frac{2}{N + 1} = \frac{2}{7 + 1} = 0.25$$

#### B. Physiological Causes of Weight Noise
1. **Sodium Spikes:** High extracellular sodium retention ($1\text{ g sodium}$ holds $\approx 1\text{ L} / 1\text{ kg}$ water transiently).
2. **Glycogen Replenishment:** $1\text{ g stored glycogen}$ binds $3\text{ to } 4\text{ g}$ of water.
3. **Menstrual Phase:** Luteal phase progesterone changes cause $1.0\text{–}3.0\text{ kg}$ temporary fluid retention.
4. **Exercise Inflammation:** Micro-tears in muscle tissue post-resistance training cause acute localized inflammation and fluid retention.

#### C. Target Rate of Loss Tracking
* **Healthy Target Band:** $0.5\%\text{ to } 1.0\%$ of total body weight lost per week.
* **Warning Band:** $> 1.5\%$ body weight loss per week (risk of lean tissue loss & gallstones).

---

### 3.2 Macro & Calorie Analytics
* **Weekly Energy Deficit Balance:** Total weekly actual intake vs total weekly target TDEE.
* **Macro Distribution Consistency:** Weekly pie chart comparing targeted vs actual macronutrient percentages.
* **Adherence Consistency Index:** Percentage of days in the week meeting the $\pm 10\%$ target window.

---

### 3.3 Body Composition & Measurement Analytics
* **Bi-Weekly Circumference Tracking:** Waist (at navel), Hips (widest point), Thighs, Chest, Arms.
* **Key Clinical Ratios:**
  * **Waist-to-Height Ratio (WtHR):** Target $< 0.50$ (indicates low cardiometabolic risk).
  * **Waist-to-Hip Ratio (WHR):** Target $< 0.85$ for females, $< 0.90$ for males.

---

### 3.4 Plateau Detection & Troubleshooting Algorithm

```
                  Has 7DMA weight been flat for ≥ 21 consecutive days?
                                         │
                        ┌────────────────┴────────────────┐
                        ▼                                 ▼
                       NO                                YES
                        │                                 │
                 Continue Plan                            │
                                                          ▼
                                          Are body measurements decreasing?
                                                        │
                                       ┌────────────────┴────────────────┐
                                       ▼                                 ▼
                                      YES                                NO
                                       │                                 │
                          Body Recomposition Occurring                   │
                          (Fat loss + Muscle gain)                       │
                                                                         ▼
                                                     Run Clinical Plateau Audit:
                                                     1. Verify logging accuracy
                                                     2. Audit drop in NEAT steps
                                                     3. Check sleep/stress levels
                                                     4. Recalculate TDEE for lost mass
                                                                         │
                                                        ┌────────────────┴────────────────┐
                                                        ▼                                 ▼
                                              True Metabolic Adaptation           Elevated Stress/Cortisol
                                                        │                                 │
                                                        ▼                                 ▼
                                             Adjust calories (-100 kcal)         Prescribe 1-2 Wk Diet Break
                                             or increase step goal               at Maintenance Calories
```

---

## 4. User Readiness & Engagement Features

### 4.1 Behavioral Readiness & Onboarding
* **Transtheoretical Model (TTM) Readiness Assessment:**
  Onboarding questionnaire categorizes user into Stage of Change (Contemplation, Preparation, Action) to customize nudge frequency and goal intensity.
* **Habit Stacking Prompting:**
  Structure habit triggers using James Clear's framework: *"After I [Morning Coffee], I will [Pre-Log Meals in App]"*.
* **Flexible Calorie Banking (Weekend Flex):**
  Allows users to reduce daily targets by $100\text{–}200\text{ kcal}$ Monday through Thursday to "bank" $400\text{–}800\text{ kcal}$ extra for Friday/Saturday social meals while keeping overall weekly calorie deficit constant.

---

### 4.2 Gamification & Positive Reinforcement
* **Streak Protection Shield ("Streak Forgiveness"):**
  Allow 1 "Streak Shield" per month. Prevents complete loss of a logging streak due to a single missed day, preventing the **"What-the-Hell Effect"** (cognitive distortion where a minor lapse leads to total abandonment).
* **Multi-Dimensional Badges:**
  Award badges for process habits rather than just scale drops (e.g., *"7-Day Protein Master"*, *"Hydration Hero"*, *"8-Hour Sleep Champion"*).

---

### 4.3 Clinical Safety & Red Flag Alerts
1. **Low Calorie Warnings:**
   System prevents saving target goals below $1,200\text{ kcal}$ (F) / $1,500\text{ kcal}$ (M) without explicit disclaimer and clinical warning pop-up.
2. **Disordered Eating Screening:**
   System flags behaviors such as persistent energy restriction $< 1,000\text{ kcal/day}$ for $> 3$ consecutive days, rapid purging logs, or severe negative self-talk entries, surfacing health resources and support helplines.
3. **Maintenance Transition & Reverse Dieting:**
   When user reaches target weight, automatically initiate a **Reverse Dieting Protocol** (+50–100 kcal/day added per week) to step up intake back to Maintenance TDEE without rapid fat rebound.

---

## Conclusion & Implementation Checklist
1. **Engine Math:** Implement Mifflin-St Jeor + PAL multipliers with safety floors ($1200\text{ F}/1500\text{ M}$).
2. **Smoothing:** Implement 7DMA / EMA algorithms for trend visualizers.
3. **Logging System:** Implement pre-logging, portion visualizer, and flexible calorie banking.
4. **Safety Net:** Integrate plateau diagnosis flow, streak shields, and low-calorie alerts.
