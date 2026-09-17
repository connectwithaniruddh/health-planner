import { create } from 'zustand';
import { openDB } from 'idb';
import { z } from 'zod';

export interface Observation { id:string; marker:string; value:number; unit:string; date:string; source:string; referenceLow?:number; referenceHigh?:number; notes?:string; updatedAt?:string }
export interface HealthProfile { name:string; age?:number; heightCm?:number; weightKg?:number; targetWeightKg?:number; goal:string; dietaryPreference:string; allergies:string[]; dislikes:string[]; cuisines:string[]; conditions:string[]; medications:string; clinicalNotes:string; pregnancy:string; exerciseExperience:string; limitations:string; equipment:string[]; budget:string; cookingMinutes?:number; timezone:string; wakeTime:string; mealTimes:string; reminderTime:string; onboarded:boolean; [key:string]:any }
export interface HealthState { schemaVersion:4; revision:number; updatedAt:string; profile:HealthProfile; onboarding:{step:number;complete:boolean}; observations:Observation[]; plans:any[]; preferenceEvents:any[]; sessions:any[]; occurrences:any[]; diary:any[]; settings:{theme:string;reduceTransparency:boolean;[key:string]:any}; tombstones:Record<string,string>; conflicts:any[]; [key:string]:any }
export const emptyState = ():HealthState => ({schemaVersion:4,revision:0,updatedAt:new Date().toISOString(),profile:{name:'',goal:'',dietaryPreference:'',allergies:[],dislikes:[],cuisines:[],conditions:[],medications:'',clinicalNotes:'',pregnancy:'unknown',exerciseExperience:'',limitations:'',equipment:[],budget:'',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,wakeTime:'07:00',mealTimes:'08:00,13:00,19:00',reminderTime:'18:00',onboarded:false},onboarding:{step:0,complete:false},observations:[],plans:[],preferenceEvents:[],sessions:[],occurrences:[],diary:[],settings:{theme:'dark',reduceTransparency:false},tombstones:{},conflicts:[]});
const observationSchema=z.object({id:z.string().min(1),marker:z.string().min(1),value:z.number().finite(),unit:z.string().min(1),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),source:z.string(),referenceLow:z.number().finite().optional(),referenceHigh:z.number().finite().optional()}).passthrough();
const schema=z.object({schemaVersion:z.literal(4),revision:z.number().int().nonnegative(),updatedAt:z.string(),profile:z.object({name:z.string(),onboarded:z.boolean(),allergies:z.array(z.string()),conditions:z.array(z.string()),dietaryPreference:z.string()}).passthrough(),onboarding:z.object({step:z.number().int().min(0).max(6),complete:z.boolean()}),observations:z.array(observationSchema),plans:z.array(z.any()),preferenceEvents:z.array(z.any()),sessions:z.array(z.any()),occurrences:z.array(z.any()),diary:z.array(z.any()),settings:z.object({theme:z.string(),reduceTransparency:z.boolean()}).passthrough(),tombstones:z.record(z.string()),conflicts:z.array(z.any())}).passthrough();
export function validateHealthState(value:unknown):HealthState {const parsed=schema.parse(value); return {...emptyState(),...parsed,profile:{...emptyState().profile,...parsed.profile}} as HealthState;}
const db=()=>openDB('health_planner_v4',1,{upgrade(d){d.createObjectStore('state');d.createObjectStore('recovery');}});
const same=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b);
// Three-way merge preserves unrelated tab edits. Same-field conflicts retain both versions.
export function mergeHealthStates(base:HealthState,local:HealthState,remote:HealthState):HealthState {
  const conflicts:any[]=[];
  function merge(b:any,l:any,r:any,path:string):any {
    if(same(l,b))return r;if(same(r,b)||same(l,r))return l;
    if(Array.isArray(l)&&Array.isArray(r)&&[...l,...r].every(x=>x&&typeof x==='object'&&typeof x.id==='string')){
      const bs=new Map((Array.isArray(b)?b:[]).map((x:any)=>[x.id,x]));const ls=new Map(l.map(x=>[x.id,x]));const rs=new Map(r.map(x=>[x.id,x]));
      return [...new Set([...ls.keys(),...rs.keys()])].map(id=>merge(bs.get(id),ls.get(id),rs.get(id),`${path}.${id}`)).filter(x=>x!==undefined);
    }
    if(l&&r&&typeof l==='object'&&typeof r==='object'&&!Array.isArray(l)&&!Array.isArray(r))return Object.fromEntries([...new Set([...Object.keys(l),...Object.keys(r)])].map(k=>[k,merge(b?.[k],l[k],r[k],`${path}.${k}`)]));
    conflicts.push({id:crypto.randomUUID(),path,local:l??null,remote:r??null,date:new Date().toISOString()});return r;
  }
  const result=merge(base,local,remote,'') as HealthState;result.conflicts=[...remote.conflicts,...conflicts];return result;
}
async function migrateLegacy():Promise<HealthState>{
  const result=emptyState();
  if(indexedDB.databases){const list=await indexedDB.databases();if(!list.some(x=>x.name==='health_planner_db'))return result;}
  const old=await openDB('health_planner_db');
  if(!old.objectStoreNames.contains('app_store')){old.close();return result;}
  const legacy=await old.get('app_store','latest_store');old.close();if(!legacy)return result;
  const d=await db();await d.put('recovery',legacy,`legacy-${Date.now()}`);
  if(!legacy.profile||typeof legacy.profile!=='object')throw new Error('Legacy data needs review. Original data has been preserved.');
  const p=legacy.profile;result.profile={...result.profile,...p,weightKg:p.currentWeightKg,goal:p.primaryGoal||'',conditions:p.medicalConditions||[],onboarded:Boolean(p.isOnboarded)};
  result.onboarding.complete=result.profile.onboarded;
  result.observations=(legacy.medicalMarkers||[]).map((m:any)=>({id:m.id||crypto.randomUUID(),marker:m.markerKey||m.markerName,value:m.value,unit:m.unit,date:m.testDate?.slice(0,10),source:'Imported legacy record — verify original report'})).filter((x:any)=>observationSchema.safeParse(x).success);
  result.diary=Object.entries(legacy.dailyLogs||{}).map(([date,log]:any)=>({id:date,...log,date}));result.legacyArchive=legacy;return validateHealthState(result);
}
let queue=Promise.resolve();let initialization:Promise<void>|undefined;let channel:BroadcastChannel|undefined;
interface Store {ready:boolean;error:string|null;state:HealthState;init:()=>Promise<void>;update:(mutator:((draft:HealthState)=>void)|Partial<HealthState>)=>Promise<boolean>;exportData:()=>string;importData:(raw:string)=>Promise<boolean>;clearError:()=>void}
export const useHealthStore=create<Store>((set,get)=>({ready:false,error:null,state:emptyState(),clearError:()=>set({error:null}),
  init:()=>initialization??=(async()=>{try{const d=await db();const saved=await d.get('state','current');const state=saved?validateHealthState(saved):await migrateLegacy();if(!saved)await d.put('state',state,'current');set({state,ready:true});if(typeof BroadcastChannel!=='undefined'){channel=new BroadcastChannel('health-planner-v4');channel.onmessage=async()=>{try{const latest=await (await db()).get('state','current');if(latest&&latest.revision>get().state.revision)set({state:validateHealthState(latest)});}catch(e){set({error:String(e)});}};} }catch(e){set({ready:true,error:`Storage unavailable: ${String(e)}. Your existing data has not been replaced.`});}})(),
  update:(mutator)=>{let resolve!:(value:boolean)=>void;const promise=new Promise<boolean>(r=>resolve=r);const base=structuredClone(get().state);const local=structuredClone(base);try{typeof mutator==='function'?mutator(local):Object.assign(local,mutator);}catch(e){set({error:String(e)});resolve(false);return promise;}
    queue=queue.then(async()=>{try{const d=await db();const tx=d.transaction(['state','recovery'],'readwrite');const remote=await tx.objectStore('state').get('current')||base;const next=remote.revision===base.revision?local:mergeHealthStates(base,local,remote);next.revision=remote.revision+1;next.updatedAt=new Date().toISOString();for(const key of ['observations','plans','sessions','occurrences','diary']){for(const row of base[key]||[])if(row.id&&!(local[key]||[]).some((r:any)=>r.id===row.id))next.tombstones[`${key}:${row.id}`]=next.updatedAt;next[key]=(next[key]||[]).filter((r:any)=>!next.tombstones[`${key}:${r.id}`]);}validateHealthState(next);await tx.objectStore('recovery').put(remote,`revision-${remote.revision}`);const keys=await tx.objectStore('recovery').getAllKeys();for(const key of keys.filter(k=>String(k).startsWith('revision-')).slice(0,-20))await tx.objectStore('recovery').delete(key);await tx.objectStore('state').put(next,'current');await tx.done;set({state:next,error:next.conflicts.length?'Concurrent edits need review in Settings; both versions were retained.':null});channel?.postMessage(next.revision);resolve(true);}catch(e){set({error:`Could not save: ${String(e)}. Please export your data and retry.`});resolve(false);}});return promise;
  },exportData:()=>JSON.stringify(get().state,null,2),importData:async(raw)=>{try{const imported=validateHealthState(JSON.parse(raw));return await get().update(draft=>{const merged=mergeHealthStates(emptyState(),imported,draft);Object.assign(draft,merged);});}catch(e){set({error:`Import rejected: ${String(e)}. Existing data is unchanged.`});return false;}}
}));


