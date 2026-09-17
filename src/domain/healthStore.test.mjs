import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const directory=await mkdtemp(join(tmpdir(),'hp-store-'));
try {await build({entryPoints:['src/domain/healthStore.ts'],bundle:true,platform:'node',format:'esm',outfile:join(directory,'store.mjs')});const {emptyState,mergeHealthStates,validateHealthState}=await import(pathToFileURL(join(directory,'store.mjs')).href);const base=emptyState();const local=structuredClone(base);const remote=structuredClone(base);local.profile.name='Local';remote.profile.goal='Remote';const merged=mergeHealthStates(base,local,remote);assert.equal(merged.profile.name,'Local');assert.equal(merged.profile.goal,'Remote');const conflicting=mergeHealthStates(base,{...local,profile:{...local.profile,name:'One'}},{...remote,profile:{...remote.profile,name:'Two'}});assert.equal(conflicting.profile.name,'Two');assert.equal(conflicting.conflicts.length,1);assert.equal(validateHealthState(emptyState()).schemaVersion,4);console.log('Store validation and three-way conflict preservation passed (5).');}finally{await rm(directory,{recursive:true,force:true});}
