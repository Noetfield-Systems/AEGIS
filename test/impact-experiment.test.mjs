import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateImpactExperiment} from '../assurance/impact-experiment.mjs';
import {impactExperimentFixture} from '../fixtures/impact-experiment.mjs';

test('real compiler computes prediction labels, not caller-provided predictions',()=>{
 const input=impactExperimentFixture(),copy=structuredClone(input);
 const a=evaluateImpactExperiment(input),b=evaluateImpactExperiment(input);
 assert.deepEqual(a,b);
 assert.deepEqual(input,copy);
 assert.equal(a.kind,'compiled-policy-impact-benchmark');
 assert.equal(a.caseCount,8);
 assert.deepEqual([a.metrics.tp,a.metrics.fp,a.metrics.tn,a.metrics.fn],[3,1,3,1]);
 assert.equal(a.metrics.precision,0.75);
 assert.equal(a.metrics.recall,0.75);
 assert.equal(a.metrics.specificity,0.75);
 assert.ok(a.metrics.precisionWilson95.lower<0.75);
 assert.ok(a.metrics.precisionWilson95.upper>0.75);
 assert.ok(a.metrics.recallWilson95.lower<0.75);
 assert.equal(a.predictions.filter(x=>!x.matchesReference).length,2);
 assert.equal(a.predictions.find(x=>x.id==='changed-B').predictedAffected,false);
 assert.equal(a.predictions.find(x=>x.id==='owner-B').predictedAffected,true);
 assert.equal(a.referenceLabelsIndependentlyVerified,false);
 assert.equal(a.trl5EvidenceEstablished,false);
 assert.equal(a.iscEvidenceCredited,false);
});

test('caller prediction attempts do not overwrite native compiler output',()=>{
 const input=impactExperimentFixture();
 input.cases.forEach(c=>c.predictedAffected=!c.referenceAffected);
 const out=evaluateImpactExperiment(input);
 assert.equal(out.predictions.find(x=>x.id==='changed-A').predictedAffected,true);
 assert.equal(out.predictions.find(x=>x.id==='unchanged-A').predictedAffected,false);
});

test('missing system, duplicate labels and invalid provenance fail safely',()=>{
 const x=impactExperimentFixture();x.cases[0].systemId='DOES_NOT_EXIST';
 assert.throws(()=>evaluateImpactExperiment(x),/unknown system/);
 const y=impactExperimentFixture();y.cases[1].id=y.cases[0].id;
 assert.throws(()=>evaluateImpactExperiment(y),/duplicate benchmark case/);
 const z=impactExperimentFixture();z.cases[0].referenceAffected='uncertain';
 assert.throws(()=>evaluateImpactExperiment(z),/boolean/);
 const empty=impactExperimentFixture();empty.cases=[];
 assert.throws(()=>evaluateImpactExperiment(empty),/2–40/);
});

test('benchmark includes independent-test limitations, receipt hashes and non-TRL outcome',()=>{
 const out=evaluateImpactExperiment(impactExperimentFixture());
 assert.match(out.receiptHash,/^sha256:[a-f0-9]{64}$/);
 assert.match(out.metricReceiptHash,/^sha256:[a-f0-9]{64}$/);
 assert.ok(out.predictions.every(x=>/^sha256:[0-9a-f]{64}$/.test(x.policyImpactReceipt)));
 assert.equal(out.externalCompetitiveBenchmark,false);
 assert.equal(out.representativeEnvironmentVerified,false);
 assert.ok(out.limitations.some(s=>s.includes('blind')));
});
