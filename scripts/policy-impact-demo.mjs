/** Offline synthetic federal source impact planning demo; does not claim official compliance. */
import assert from 'node:assert/strict';
import {compilePolicyImpact} from '../assurance/policy.mjs';
import {policyImpactFixture} from '../fixtures/policy-impact.mjs';

const input=policyImpactFixture();
const result=compilePolicyImpact(input);
assert.equal(result.changedClauses.length,1);
assert.equal(result.impactedSystems.length,1);
assert.equal(result.reassessmentQueue.length,3);
assert.equal(result.iscEvidenceCredited,false);
assert.equal(result.decision,'PENDING_HUMAN_REVIEW');
assert.deepEqual(result.unaffectedSystemIds,['SIMULATED-DPT-B']);
process.stdout.write(JSON.stringify(result,null,2)+'\n');
