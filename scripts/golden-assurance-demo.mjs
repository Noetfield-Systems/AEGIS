/**
 * Offline, independently reproducible synthetic Golden Assurance Replay.
 * Run: node scripts/golden-assurance-demo.mjs
 * Output is deterministic and carries a content-hash receipt; no ISC credit.
 */
import assert from 'node:assert/strict';
import {runNative} from '../assurance/native.mjs';
import {createGoldenFixture} from '../fixtures/golden.mjs';

const fixture = createGoldenFixture();
const result = runNative({mode: 'golden-replay', input: fixture});
assert.deepEqual(result.changedControls, ['C-DATA', 'C-OUTPUT']);
assert.equal(result.assessmentsReplayed.length, 1);
const delta = result.assessmentsReplayed[0].controlChanges;
assert.ok(delta.every(c => c.independentlyRecomputedBefore.finding === 'MET'));
assert.ok(delta.every(c => c.recomputedAfter.finding === 'NOT_MET'));
assert.equal(result.assessmentsReplayed[0].reviewerDecision, 'PENDING_HUMAN_REVIEW');
assert.equal(result.iscEvidenceCredited, false);
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
