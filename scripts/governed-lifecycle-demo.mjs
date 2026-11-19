/** Reproducible all-synthetic governed lifecycle exercise. No reviewer trust or government applicability. */
import assert from 'node:assert/strict';
import {runNative} from '../assurance/native.mjs';
import {governedFixture} from '../fixtures/governed.mjs';
const result=runNative({mode:'governed-lifecycle',input:governedFixture()});
assert.equal(result.completedNativeReplays,1);
assert.equal(result.lifecyclePlans.filter(x=>x.phase==='IN_PROGRESS').length,1);
assert.equal(result.lifecyclePlans.filter(x=>x.phase==='PLANNED').length,1);
assert.ok(result.technicalApprovalChecks.every(x=>x.status!=='TECHNICAL_MAPPING_SIGNATURE_VALID'));
assert.equal(result.regulatoryStatus,'UNABLE_TO_DETERMINE');
assert.equal(result.iscEvidenceCredited,false);
process.stdout.write(JSON.stringify(result,null,2)+'\n');
