import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildOfficerEvidencePack} from '../assurance/officer-pack.mjs';
import {contentHash} from '../assurance/replay.mjs';
const matrix=JSON.parse(await readFile(new URL('../ops/isc-e1-e6-matrix.json',import.meta.url),'utf8'));

test('Officer Evidence Pack is repeatable, hash-bound, source-linked and transparently partial',()=>{
 const one=buildOfficerEvidencePack(matrix),two=buildOfficerEvidencePack(matrix);
 assert.deepEqual(one,two,'fresh computations must be bytewise reproducible');
 const {receiptHash,...content}=one;
 assert.equal(contentHash(content),receiptHash);
 assert.equal(one.essentialOutcomes.length,6);
 assert.equal(one.essentialOutcomesFullyVerified,0);
 assert.ok(one.essentialOutcomes.every(g=>g.fullyVerified===false&&g.executableTests.length&&g.missingIndependentEvidence.length));
 assert.deepEqual(one.essentialOutcomes.map(g=>g.id),['E1','E2','E3','E4','E5','E6']);
 assert.equal(one.sourceReferences.fullDocumentsCapturedAndHashed,false);
 assert.equal(one.sourceReferences.originalByteCaptureCount,1);
 assert.equal(one.candidateControlMapping.clauseCount,6);
 assert.equal(one.candidateControlMapping.expertApproval,false);
 assert.equal(one.candidateControlMapping.iscEvidenceCredited,false);
 assert.equal(one.candidateControlMapping.originalByteSha256,one.sourceReferences.originalByteCaptureReceipts[0].originalBytesSha256);
 assert.equal(one.sourceReferences.approvedRegulatoryMappings,0);
 assert.equal(one.officialPolicyApplicabilityVerified,false);
 assert.equal(one.independentHumanReviewerVerified,false);
 assert.equal(one.trl5Established,false);
 assert.equal(one.externalComparisonMeasured,false);
 assert.equal(one.iscEvidenceCredited,false);
 assert.equal(one.technicalExperiment.summary.historicalAssessmentsReexecuted,1);
 assert.equal(one.technicalExperiment.summary.changedTechnicalFindings,2);
 assert.equal(one.technicalExperiment.summary.regulatoryComplianceStatus,'UNABLE_TO_DETERMINE');
 assert.equal(one.lifecycleExperiment.completedNativeReplays,1);
 assert.equal(one.syntheticBenchmark.metrics.sampleCount,8);
 assert.equal(one.syntheticBenchmark.metrics.precision,0.75);
 assert.equal(one.syntheticBenchmark.metrics.recall,0.75);
 assert.equal(one.syntheticBenchmark.metrics.fn,1);
 assert.equal(one.syntheticBenchmark.referenceLabelsIndependentlyVerified,false);
 assert.equal(one.executionOrder.length,10);
 assert.equal(one.executionOrder.find(x=>x.step===9).status,'NOT_ESTABLISHED');
});

test('Officer Evidence Pack refuses incomplete or non-self-assessed contract',()=>{
 assert.throws(()=>buildOfficerEvidencePack({selfAssessedOnly:false,gates:[]}),TypeError);
 assert.throws(()=>buildOfficerEvidencePack({selfAssessedOnly:true,gates:matrix.gates.slice(1)}),TypeError);
});
