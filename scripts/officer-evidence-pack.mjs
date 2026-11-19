/** Reproduce the complete bounded, synthetic Officer Evidence Pack offline.
 * Never uses customer data, live government documents or uncontrolled AI output.
 * npm install && node scripts/officer-evidence-pack.mjs > officer-pack.json
 */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {buildOfficerEvidencePack} from '../assurance/officer-pack.mjs';

const matrix=JSON.parse(await readFile(new URL('../ops/isc-e1-e6-matrix.json',import.meta.url),'utf8'));
const pack=buildOfficerEvidencePack(matrix);
assert.equal(pack.essentialOutcomes.length,6);
assert.equal(pack.essentialOutcomesFullyVerified,0);
assert.equal(pack.technicalExperiment.summary.regulatoryComplianceStatus,'UNABLE_TO_DETERMINE');
assert.equal(pack.syntheticBenchmark.referenceLabelsIndependentlyVerified,false);
assert.equal(pack.trl5Established,false);
assert.match(pack.receiptHash,/^sha256:[0-9a-f]{64}$/);
process.stdout.write(JSON.stringify(pack,null,2)+'\n');
