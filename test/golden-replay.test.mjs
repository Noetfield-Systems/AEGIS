import test from 'node:test';
import assert from 'node:assert/strict';
import {runNative} from '../assurance/native.mjs';
import {contentHash, FINDING_STATES} from '../assurance/replay.mjs';
import {createGoldenFixture} from '../fixtures/golden.mjs';

function run(fixture) { return runNative({mode: 'golden-replay', input: fixture}); }
function changes(result) { return result.assessmentsReplayed[0].controlChanges; }

test('golden replay: executes native data and output metrics against changed policies', () => {
  const input = createGoldenFixture();
  const snapshot = structuredClone(input);
  const a = run(input), b = run(input);
  assert.deepEqual(a, b, 'deterministic result and receipt');
  assert.deepEqual(input, snapshot, 'historical inputs and assessment never mutated');
  assert.equal(a.experimental, true);
  assert.equal(a.iscEvidenceCredited, false);
  assert.deepEqual(a.changedControls, ['C-DATA', 'C-OUTPUT']);
  assert.deepEqual(a.affectedSystems, [{systemId: 'synthetic-A', changedControls: ['C-DATA', 'C-OUTPUT']}]);
  assert.deepEqual(a.unaffectedSystems, ['synthetic-B']);
  assert.deepEqual(a.unchangedAssessments, ['assessment-B-v1']);
  assert.equal(a.assessmentsReplayed.length, 1);
  const delta = changes(a);
  assert.deepEqual(delta.map(c => c.independentlyRecomputedBefore.finding), ['MET', 'MET']);
  assert.deepEqual(delta.map(c => c.recomputedAfter.finding), ['NOT_MET', 'NOT_MET']);
  assert.equal(delta[0].recomputedAfter.measurement, 0.333333);
  assert.equal(delta[1].recomputedAfter.measurement, 0.5);
  assert.deepEqual(delta.map(c => c.changedFinding), [true, true]);
  assert.ok(delta.every(c => c.historicalInconsistency === false));
  assert.equal(a.assessmentsReplayed[0].reviewerDecision, 'PENDING_HUMAN_REVIEW');
  assert.match(a.receiptHash, /^sha256:[a-f0-9]{64}$/);
  assert.deepEqual(a.assessmentsReplayed[0].sourceAssessment, input.assessments[0]);
});

test('missing or tampered evidence prevents a false MET', () => {
  const input = createGoldenFixture();
  input.after.controls.find(c => c.id === 'C-OUTPUT').threshold = 0.4;
  delete input.systems[0].evidence['C-OUTPUT'];
  const missing = run(input);
  assert.equal(changes(missing).find(c => c.controlId === 'C-OUTPUT').recomputedAfter.finding, 'UNABLE_TO_DETERMINE');
  input.systems[0].evidence['C-OUTPUT'] = {status: 'VALID', fixtureHash: 'sha256:tampered'};
  const tampered = run(input);
  assert.equal(changes(tampered).find(c => c.controlId === 'C-OUTPUT').recomputedAfter.finding, 'UNABLE_TO_DETERMINE');
});

test('partially met state is measured and not upgraded to MET', () => {
  const input = createGoldenFixture();
  const output = input.after.controls.find(c => c.id === 'C-OUTPUT');
  output.partialThreshold = 0.4;
  const result = run(input);
  assert.equal(changes(result).find(c => c.controlId === 'C-OUTPUT').recomputedAfter.finding, 'PARTIALLY_MET');
});

test('explicit not applicable is preserved as fifth supported state', () => {
  const input = createGoldenFixture();
  input.after.controls.find(c => c.id === 'C-DATA').applicable = false;
  const result = run(input);
  assert.equal(changes(result).find(c => c.controlId === 'C-DATA').recomputedAfter.finding, 'NOT_APPLICABLE');
  assert.deepEqual(new Set(FINDING_STATES), new Set(['MET', 'PARTIALLY_MET', 'NOT_MET', 'NOT_APPLICABLE', 'UNABLE_TO_DETERMINE']));
});

test('historical fixture changes are rejected instead of laundering prior evidence', () => {
  const input = createGoldenFixture();
  input.systems[0].inputs.data.records[0].riskScore = 99;
  assert.throws(() => run(input), /historical input hash mismatch/);
});

test('unknown system, duplicate controls and mismatched version fail closed', () => {
  const a = createGoldenFixture();
  a.assessments[0].systemId = 'other';
  assert.throws(() => run(a), /unknown system/);
  const b = createGoldenFixture();
  b.before.controls.push({...b.before.controls[0]});
  assert.throws(() => run(b), /duplicate/);
  const c = createGoldenFixture();
  c.assessments[0].policyVersion = 'fabricated-version';
  assert.throws(() => run(c), /original policy version/);
});

test('missing policy control cannot be upgraded to a positive finding', () => {
  const input = createGoldenFixture();
  input.after.controls = input.after.controls.filter(c => c.id !== 'C-DATA');
  const result = run(input);
  assert.equal(changes(result).find(c => c.controlId === 'C-DATA').recomputedAfter.finding, 'UNABLE_TO_DETERMINE');
});

test('replay fixture hashes are canonical over object key order', () => {
  assert.equal(contentHash({a: 1, b: {x: 1, y: 2}}), contentHash({b: {y: 2, x: 1}, a: 1}));
});
