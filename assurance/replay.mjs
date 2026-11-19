/**
 * AEGIS Golden Assurance Replay: deterministic, first-party historical reassessment.
 * Synthetic fixtures only until source-policy mappings and human reviewer decisions are verified.
 * This library NEVER changes the existing readiness store or awards ISC credit.
 */
import {createHash} from 'node:crypto';

export const FINDING_STATES = Object.freeze([
  'MET', 'PARTIALLY_MET', 'NOT_MET', 'NOT_APPLICABLE', 'UNABLE_TO_DETERMINE'
]);
export const REPLAY_VERSION = 'golden-replay-v0.1.0';

function fail(message) { throw new TypeError(message); }
function object(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(label + ' must be an object');
  return value;
}
function array(value, label, max = 500) {
  if (!Array.isArray(value) || value.length > max) fail(label + ' must be an array of at most ' + max);
  return value;
}
function identifier(value, label) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(value)) fail(label + ' must be a bounded identifier');
  return value;
}
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().filter(k => value[k] !== undefined).map(k => [k, canonical(value[k])]));
  }
  return value;
}
export function contentHash(value) {
  return 'sha256:' + createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}
function unique(items, label) {
  const set = new Set();
  for (const item of items) {
    if (set.has(item)) fail(label + ' contains duplicate identifiers');
    set.add(item);
  }
}
function policy(input, label) {
  object(input, label);
  identifier(input.version, label + '.version');
  const controls = array(input.controls, label + '.controls', 80);
  for (const c of controls) {
    object(c, 'control'); identifier(c.id, 'control.id');
    if (c.applicable === false) continue;
    if (!['data', 'classifier', 'output'].includes(c.kind)) fail('control.kind is not a native evaluator');
    const allowed = {
      data: ['duplicateRate', 'missingRate', 'typeErrorRate'],
      classifier: ['accuracy', 'precision', 'recall', 'f1'],
      output: ['passRate']
    };
    if (!allowed[c.kind].includes(c.metric)) fail('unsupported native metric');
    if (c.kind === 'data' && c.metric !== 'duplicateRate') identifier(c.field, 'control.field');
    if (!['>=', '<='].includes(c.operator)) fail('control.operator must be >= or <=');
    if (typeof c.threshold !== 'number' || !Number.isFinite(c.threshold) || c.threshold < 0 || c.threshold > 1) fail('control.threshold must be in [0,1]');
    if (c.partialThreshold !== undefined && (typeof c.partialThreshold !== 'number' || !Number.isFinite(c.partialThreshold) || c.partialThreshold < 0 || c.partialThreshold > 1)) fail('control.partialThreshold must be in [0,1]');
  }
  unique(controls.map(c => c.id), 'policy controls');
  return new Map(controls.map(c => [c.id, c]));
}
function metricValue(result, control) {
  if (control.kind === 'data' && control.metric !== 'duplicateRate') {
    const field = result.metrics.fields[control.field];
    return field ? field[control.metric] : null;
  }
  return result.metrics[control.metric] ?? null;
}
function passes(value, operator, threshold) {
  return operator === '>=' ? value >= threshold : value <= threshold;
}
function assess(control, system, evaluators, cache) {
  if (!control) return {finding: 'UNABLE_TO_DETERMINE', reason: 'Policy control is missing or retired', measurement: null};
  if (control.applicable === false) return {finding: 'NOT_APPLICABLE', reason: 'Explicitly not applicable in this synthetic policy', measurement: null};
  const fixture = system.inputs[control.kind];
  if (!fixture) return {finding: 'UNABLE_TO_DETERMINE', reason: 'Native evaluation fixture missing', measurement: null};
  const sourceHash = contentHash(fixture);
  const evidence = system.evidence?.[control.id];
  if (!evidence || evidence.status !== 'VALID' || evidence.fixtureHash !== sourceHash) {
    return {finding: 'UNABLE_TO_DETERMINE', reason: 'Missing, invalid or input-unbound evidence', measurement: null, inputHash: sourceHash};
  }
  if (!cache.has(sourceHash + ':' + control.kind)) {
    const evaluator = evaluators[control.kind];
    if (typeof evaluator !== 'function') fail('native evaluator unavailable: ' + control.kind);
    cache.set(sourceHash + ':' + control.kind, evaluator(fixture));
  }
  const evaluation = cache.get(sourceHash + ':' + control.kind);
  const value = metricValue(evaluation, control);
  if (value === null || !Number.isFinite(value)) {
    return {finding: 'UNABLE_TO_DETERMINE', reason: 'Native metric undefined or unsupported on this fixture', measurement: value, inputHash: sourceHash, evaluatorVersion: evaluation.methodVersion};
  }
  let finding = passes(value, control.operator, control.threshold) ? 'MET' : 'NOT_MET';
  if (finding === 'NOT_MET' && control.partialThreshold !== undefined && passes(value, control.operator, control.partialThreshold)) finding = 'PARTIALLY_MET';
  return {
    finding, reason: 'Deterministic native metric threshold applied; pending authorized human review',
    measurement: value, threshold: control.threshold, operator: control.operator,
    inputHash: sourceHash, evidenceHash: contentHash(evidence), evaluatorVersion: evaluation.methodVersion,
    evaluatorResultHash: contentHash(evaluation)
  };
}

/**
 * Historical immutable input -> versioned policy changes -> native reassessment.
 * Requires previously completed assessment records and bound, unmodified fixture hashes.
 * Returns a new replay object; source assessments and original findings remain unchanged.
 */
export function replayCompleted(input, evaluators) {
  object(input, 'replay request'); object(evaluators, 'native evaluators');
  identifier(input.scenarioId, 'scenarioId');
  const older = policy(input.before, 'before');
  const newer = policy(input.after, 'after');
  if (input.before.version === input.after.version) fail('policy version must change');
  const systems = array(input.systems, 'systems', 40);
  const assessments = array(input.assessments, 'assessments', 300);
  unique(systems.map(s => identifier(s.id, 'system.id')), 'systems');
  unique(assessments.map(a => identifier(a.id, 'assessment.id')), 'assessments');
  const systemById = new Map();
  for (const system of systems) {
    object(system, 'system'); object(system.inputs, 'system.inputs'); object(system.evidence, 'system.evidence');
    array(system.controlIds, 'system.controlIds', 80);
    unique(system.controlIds.map(c => identifier(c, 'system.controlId')), 'system.controlIds');
    systemById.set(system.id, system);
  }
  const changeSet = [...new Set([...older.keys(), ...newer.keys()])]
    .filter(id => contentHash(older.get(id) ?? null) !== contentHash(newer.get(id) ?? null)).sort();
  const changed = new Set(changeSet);
  const cache = new Map();
  const affectedSystems = [];
  const unaffectedSystems = [];
  for (const s of systems) {
    const matched = s.controlIds.filter(id => changed.has(id));
    if (matched.length) affectedSystems.push({systemId: s.id, changedControls: matched.sort()});
    else unaffectedSystems.push(s.id);
  }
  const replays = [];
  const unchangedAssessments = [];
  for (const assessment of assessments) {
    object(assessment, 'assessment');
    const system = systemById.get(assessment.systemId);
    if (!system) fail('assessment references an unknown system');
    object(assessment.findings, 'assessment.findings');
    if (assessment.status !== 'completed') fail('only completed assessments may be historically replayed');
    if (assessment.policyVersion !== input.before.version) fail('assessment does not reference original policy version');
    object(assessment.inputHashes, 'assessment.inputHashes');
    for (const [kind, fixture] of Object.entries(system.inputs)) {
      if (!['data', 'classifier', 'output'].includes(kind)) fail('unsupported fixture kind');
      if (assessment.inputHashes[kind] !== contentHash(fixture)) fail('historical input hash mismatch: ' + assessment.id + ':' + kind);
    }
    const impacted = system.controlIds.filter(id => changed.has(id)).sort();
    if (!impacted.length) {
      unchangedAssessments.push(assessment.id);
      continue;
    }
    const changes = impacted.map(controlId => {
      const previous = assess(older.get(controlId), system, evaluators, cache);
      const current = assess(newer.get(controlId), system, evaluators, cache);
      const observed = assessment.findings[controlId] ?? 'UNABLE_TO_DETERMINE';
      if (!FINDING_STATES.includes(observed)) fail('invalid historical finding');
      return {
        controlId, historicalRecorded: observed, independentlyRecomputedBefore: previous,
        recomputedAfter: current, changedFinding: observed !== current.finding,
        historicalInconsistency: observed !== previous.finding
      };
    });
    const originalSnapshot = structuredClone(assessment);
    replays.push({
      replayId: contentHash({scenarioId: input.scenarioId, assessmentId: assessment.id, toPolicy: input.after.version}),
      sourceAssessmentId: assessment.id, sourceAssessmentHash: contentHash(originalSnapshot),
      sourceAssessment: originalSnapshot, policyFrom: input.before.version, policyTo: input.after.version,
      controlChanges: changes, reviewerDecision: 'PENDING_HUMAN_REVIEW', reviewRequired: true,
      originalPreserved: true
    });
  }
  const result = {
    kind: 'historical-native-reassessment', methodVersion: REPLAY_VERSION, experimental: true,
    syntheticFixtureOnly: true, iscEvidenceCredited: false,
    scenarioId: input.scenarioId, beforeVersion: input.before.version, afterVersion: input.after.version,
    changedControls: changeSet, affectedSystems, unaffectedSystems: unaffectedSystems.sort(),
    assessmentsReplayed: replays, unchangedAssessments: unchangedAssessments.sort(),
    sourceInputHash: contentHash(input),
    limitations: [
      'Synthetic test-only scenario; no Canadian federal policy determination or ISC acceptance.',
      'Human approval is always pending; computed MET is a provisional technical finding.',
      'The receipt hash is tamper-evident for these bytes, not a signature or independent external attestation.'
    ]
  };
  return {...result, receiptHash: contentHash(result)};
}
