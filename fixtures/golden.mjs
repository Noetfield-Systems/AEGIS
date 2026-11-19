/**
 * Reproducible synthetic evidence fixture; no real federal policy or customer data.
 * All evidence hashes are bound to the historical evaluator inputs.
 */
import {contentHash} from '../assurance/replay.mjs';

export function createGoldenFixture() {
  const aInputs = {
    data: {schema: {riskScore: 'number'}, records: [{riskScore: 1}, {riskScore: 1}, {riskScore: 2}]},
    classifier: {labels: [1, 0, 1, 0], predictions: [1, 0, 1, 0]},
    output: {outputs: ['approved', 'rejected'], requiredPhrases: ['approved']}
  };
  const bInputs = {classifier: {labels: [1, 0], predictions: [1, 0]}};
  const evidenceFor = (inputs, controlKinds) => Object.fromEntries(Object.entries(controlKinds).map(([control, kind]) => [
    control, {status: 'VALID', source: 'synthetic-golden-fixture', fixtureHash: contentHash(inputs[kind])}
  ]));
  const controls = [
    {id: 'C-DATA', kind: 'data', metric: 'duplicateRate', operator: '<=', threshold: 0.5},
    {id: 'C-MODEL', kind: 'classifier', metric: 'accuracy', operator: '>=', threshold: 0.9},
    {id: 'C-OUTPUT', kind: 'output', metric: 'passRate', operator: '>=', threshold: 0.5}
  ];
  return {
    scenarioId: 'golden-assurance-synthetic-001',
    before: {version: 'synthetic-policy-v1', controls},
    after: {version: 'synthetic-policy-v2', controls: controls.map(c =>
      c.id === 'C-DATA' ? {...c, threshold: 0} :
      c.id === 'C-OUTPUT' ? {...c, threshold: 1} : {...c})},
    systems: [
      {id: 'synthetic-A', controlIds: ['C-DATA', 'C-MODEL', 'C-OUTPUT'],
        inputs: aInputs, evidence: evidenceFor(aInputs, {'C-DATA': 'data', 'C-MODEL': 'classifier', 'C-OUTPUT': 'output'})},
      {id: 'synthetic-B', controlIds: ['C-MODEL'],
        inputs: bInputs, evidence: evidenceFor(bInputs, {'C-MODEL': 'classifier'})}
    ],
    assessments: [
      {id: 'assessment-A-v1', systemId: 'synthetic-A', policyVersion: 'synthetic-policy-v1',
        status: 'completed', inputHashes: Object.fromEntries(Object.entries(aInputs).map(([kind, v]) => [kind, contentHash(v)])),
        findings: {'C-DATA': 'MET', 'C-MODEL': 'MET', 'C-OUTPUT': 'MET'}},
      {id: 'assessment-B-v1', systemId: 'synthetic-B', policyVersion: 'synthetic-policy-v1',
        status: 'completed', inputHashes: Object.fromEntries(Object.entries(bInputs).map(([kind, v]) => [kind, contentHash(v)])),
        findings: {'C-MODEL': 'MET'}}
    ]
  };
}
