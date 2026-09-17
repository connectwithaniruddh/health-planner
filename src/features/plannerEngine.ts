import type { CatalogRecipe } from '../catalog';
import { addDays } from './dates';
export type Slot='breakfast'|'lunch'|'dinner'|'snack';
export interface PlanEntry {id:string;date:string;slot:Slot;recipe:CatalogRecipe;portions:number;locked:boolean;reason:string;nutritionOverride?:Partial<CatalogRecipe['nutrients']>;}
export interface MealPlan {id:string;startDate:string;entries:PlanEntry[];updatedAt:string;}
export interface PlannerProfile {dietaryPreference?:string;allergies?:string[];dislikes?:string[];conditions?:string[];cuisines?:string[];cookingMinutes?:number;clinicalNotes?:string;targetCalories?:number;[key:string]:unknown;}
export interface Preference {id:string;recipeId:string;kind:'selected'|'eaten'|'favorite'|'unfavorite';at:string;}
const normal=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
export function eligible(r:CatalogRecipe,p:PlannerProfile):boolean {
 const pref=normal(p.dietaryPreference||'');
 if(pref==='vegan'&&r.dietaryType!=='VEGAN')return false;
 if(['pureveg','vegetarian'].includes(pref)&&!['VEGAN','VEGETARIAN'].includes(r.dietaryType))return false;
 if(pref==='eggetarian'&&r.dietaryType==='NON_VEGETARIAN')return false;
 const text=normal([r.name,...r.allergens,...r.ingredients.map(i=>i.name)].join(' '));
 const aliases:Record<string,string[]>= {nuts:['almond','cashew','walnut','pistachio','peanut','nut'],dairy:['milk','cheese','paneer','yogurt','curd','butter','ghee'],gluten:['wheat','barley','rye','semolina','bulgur','bread','pasta'],soy:['soy','tofu','tempeh'],egg:['egg'],shellfish:['shrimp','prawn','crab','lobster'],sesame:['sesame','tahini']};
 if((p.allergies||[]).some(a=>[normal(a),...(aliases[normal(a)]||[])].some(v=>v&&text.includes(v))))return false;
 if((p.dislikes||[]).some(a=>normal(a)&&text.includes(normal(a))))return false;
 const restrictions=Array.isArray(p.excludedIngredients)?p.excludedIngredients as string[]:[];
 return !restrictions.some(a=>text.includes(normal(a)));
}
export function rankRecipes(recipes:CatalogRecipe[],p:PlannerProfile,history:Preference[],slot:Slot,used:string[]=[],now=Date.now()) {
 const conditions=(p.conditions||[]).join(' ').toLowerCase();
 return recipes.filter(r=>eligible(r,p)).map(r=>{
   let score=0;const reasons:string[]=[];
   const target=Number(p.targetCalories)||2000;const fraction=slot==='snack'?.1:slot==='breakfast'?.25:.325;
   if(r.nutrients.calories!=null)score-=Math.abs(r.nutrients.calories-target*fraction)/40;
   const recipeTags=[...r.tags,r.name].join(' ').toLowerCase();
   if(recipeTags.includes(slot)){score+=8;reasons.push(`Fits ${slot}`);}
   const favorites=history.filter(e=>e.recipeId===r.id&&(e.kind==='favorite'||e.kind==='unfavorite')).sort((a,b)=>b.at.localeCompare(a.at));
   if(favorites[0]?.kind==='favorite'){score+=10;reasons.push('A favorite');}
   const selected=history.filter(e=>e.recipeId===r.id&&['selected','eaten'].includes(e.kind));
   const frequency=selected.reduce((sum,e)=>sum+Math.exp(-Math.max(0,now-new Date(e.at).getTime())/86400000/30),0);
   if(frequency){score+=Math.min(8,frequency*2);reasons.push('Based on your recent choices');}
   if((p.cuisines||[]).some(c=>normal(`${r.cuisine} ${r.region}`).includes(normal(c)))){score+=4;reasons.push('Matches your cuisine preferences');}
   if(p.cookingMinutes&&r.minutes>p.cookingMinutes)score-=10;
   if(/hypertension|blood pressure/.test(conditions)) {if(r.nutrients.sodium==null)score-=15;else{score-=r.nutrients.sodium/150;reasons.push(`${Math.round(r.nutrients.sodium)} mg sodium per serving`);}}
   if(/diabet|prediabet/.test(conditions)){if(r.nutrients.fiber==null||r.nutrients.carbs==null)score-=15;else{score+=Math.min(4,r.nutrients.fiber/2);reasons.push('Carbohydrate and fiber estimates available');}}
   if(/nafld|masld|fatty liver/.test(conditions)&&r.nutrients.saturatedFat!=null){score-=r.nutrients.saturatedFat;reasons.push('Saturated fat considered');}
   score-=used.filter(id=>id===r.id).length*18;
   return {recipe:r,score,reason:reasons.join(' · ')||'Fits your dietary preferences; estimated nutrition'};
 }).sort((a,b)=>b.score-a.score||a.recipe.id.localeCompare(b.recipe.id));
}
export function generatePlan(recipes:CatalogRecipe[],p:PlannerProfile,history:Preference[],startDate:string,old?:MealPlan):MealPlan {
 const entries:PlanEntry[]=[];const used:string[]=[];
 for(let day=0;day<30;day++)for(const slot of ['breakfast','lunch','dinner','snack'] as Slot[]){
  const date=addDays(startDate,day);const previous=old?.entries.find(e=>e.date===date&&e.slot===slot);
  if(previous?.locked){entries.push(previous);used.push(previous.recipe.id);continue;}
  const ranked=rankRecipes(recipes,p,history,slot,used);const candidate=ranked[0];if(!candidate)continue;
  const target=Number(p.targetCalories)||2000;const fraction=slot==='snack'?.1:slot==='breakfast'?.25:.325;
  const portions=candidate.recipe.nutrients.calories?Math.max(.5,Math.min(2,Math.round(target*fraction/candidate.recipe.nutrients.calories*4)/4)):1;
  entries.push({id:previous?.id||crypto.randomUUID(),date,slot,recipe:candidate.recipe,portions,locked:false,reason:candidate.reason});used.push(candidate.recipe.id);
 }
 return {id:old?.id||crypto.randomUUID(),startDate,entries,updatedAt:new Date().toISOString()};
}
export function totals(entries:PlanEntry[]) {
 const keys=['calories','protein','carbs','fat','fiber','sodium','saturatedFat'] as const;
 return Object.fromEntries(keys.map(k=>[k,entries.some(e=>(e.nutritionOverride?.[k]??e.recipe.nutrients[k])==null)?null:entries.reduce((n,e)=>n+((e.nutritionOverride?.[k]??e.recipe.nutrients[k])||0)*e.portions,0)])) as Record<typeof keys[number],number|null>;
}
export function groceryList(entries:PlanEntry[]) {const items=new Map<string,{name:string;grams:number}>();for(const e of entries)for(const i of e.recipe.ingredients){const old=items.get(i.foodId);items.set(i.foodId,{name:i.name,grams:(old?.grams||0)+i.grams*e.portions/e.recipe.servings});}return [...items.values()].sort((a,b)=>a.name.localeCompare(b.name));}
