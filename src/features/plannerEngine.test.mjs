import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const directory=await mkdtemp(join(tmpdir(),'hp-planner-'));
const nutrient={calories:400,protein:20,carbs:45,fat:10,fiber:8,sodium:300,saturatedFat:2};
const recipe=(id,name,allergens=[],type='VEGAN')=>({id,name,cuisine:'Indian',region:'North Indian',dietaryType:type,ingredients:[{foodId:id,name,grams:100}],servings:1,instructions:['Cook safely.'],minutes:20,nutrients:nutrient,allergens,tags:['meal']});
try {await build({entryPoints:['src/features/plannerEngine.ts'],bundle:true,platform:'node',format:'esm',outfile:join(directory,'planner.mjs')});const {eligible,generatePlan,totals}=await import(pathToFileURL(join(directory,'planner.mjs')).href);const plain=recipe('plain','Plain dal');const nuts=recipe('nuts','Peanut curry',['peanut']);const profile={dietaryPreference:'vegan',allergies:['peanut'],conditions:['hypertension'],targetCalories:1800};assert.equal(eligible(plain,profile),true);assert.equal(eligible(nuts,profile),false);const plan=generatePlan([plain,nuts],profile,[],'2026-09-17');assert.equal(plan.entries.length,120);assert.ok(plan.entries.every(entry=>entry.recipe.id==='plain'));assert.equal(totals(plan.entries.slice(0,4)).sodium,plan.entries.slice(0,4).reduce((sum,entry)=>sum+300*entry.portions,0));plan.entries[0].nutritionOverride={calories:275};assert.equal(totals([plan.entries[0]]).calories,275*plan.entries[0].portions);plan.entries[0].locked=true;const refreshed=generatePlan([plain,nuts],profile,[],'2026-09-17',plan);assert.equal(refreshed.entries[0].id,plan.entries[0].id);assert.equal(refreshed.entries[0].locked,true);console.log('Planner exclusion, 30-day generation, nutrient overrides and locks passed (7).');}finally{await rm(directory,{recursive:true,force:true});}
