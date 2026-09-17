import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const directory = await mkdtemp(join(tmpdir(), 'hp-integrations-'));
try {
 const outfile = join(directory, 'sync.mjs');
 await build({ entryPoints: ['src/integrations/sync.ts'], bundle: true, platform: 'node', format: 'esm', outfile });
 const { occurrenceStart, occurrenceFingerprint } = await import(pathToFileURL(outfile).href);
 const item = { id: 'one', title: 'Walk', date: '2026-09-17', startTime: '07:30', durationMinutes: 20, timeZone: 'Asia/Kolkata' };
 assert.equal(occurrenceStart(item).toISOString(), '2026-09-17T02:00:00.000Z');
 assert.equal(occurrenceStart({ ...item, date: '2026-01-17', timeZone: 'America/New_York' }).toISOString(), '2026-01-17T12:30:00.000Z');
 assert.equal(occurrenceStart({ ...item, timeZone: 'America/New_York' }).toISOString(), '2026-09-17T11:30:00.000Z');
 assert.throws(() => occurrenceStart({ ...item, date: '2026-03-08', startTime: '02:30', timeZone: 'America/New_York' }), /does not exist/);
 assert.notEqual(occurrenceFingerprint(item), occurrenceFingerprint({ ...item, cancelled: true }));
 assert.notEqual(occurrenceFingerprint(item), occurrenceFingerprint({ ...item, startTime: '09:00' }));
 console.log('Integration date, DST and change detection tests passed (6).');
} finally { await rm(directory, { recursive: true, force: true }); }
