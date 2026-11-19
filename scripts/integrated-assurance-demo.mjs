/** Deterministic complete scenario, synthetic source text and synthetic model measurements. */
import assert from 'node:assert/strict';
import {runNative} from '../assurance/native.mjs';
import {integratedFixture} from '../fixtures/integrated.mjs';
const result=runNative({mode:'integrated',input:integratedFixture()});
assert.equal(result.kind,'integrated-ai-assurance-simulation');
assert.equal(result.summary.historicalAssessmentsReexecuted,1);
assert.equal(result.summary.changedTechnicalFindings,2);
assert.deepEqual(result.unaffectedSystemIds,['synthetic-B']);
assert.equal(result.summary.regulatoryComplianceStatus,'UNABLE_TO_DETERMINE');
assert.equal(result.iscEvidenceCredited,false);
process.stdout.write(JSON.stringify(result,null,2)+'\n');
