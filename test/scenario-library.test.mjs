import test from 'node:test';
import assert from 'node:assert/strict';
import {scenarioLibrary} from '../fixtures/scenario-library.mjs';
import {runNative} from '../assurance/native.mjs';

test('three scenario selections execute the native engine, not prewritten browser scores',()=>{
 const scenarios=scenarioLibrary();
 assert.deepEqual(scenarios.map(x=>x.id),['combined','data','model']);
 for(const item of scenarios){
  const before=structuredClone(item);
  const a=runNative({mode:'integrated',input:item.fixture});
  const b=runNative({mode:'integrated',input:item.fixture});
  assert.deepEqual(a,b);
  assert.deepEqual(item,before);
  assert.equal(a.kind,'integrated-ai-assurance-simulation');
  assert.equal(a.iscEvidenceCredited,false);
  assert.equal(a.summary.regulatoryComplianceStatus,'UNABLE_TO_DETERMINE');
  assert.match(a.receiptHash,/^sha256:[a-f0-9]{64}$/);
 }
 const results=Object.fromEntries(scenarios.map(x=>[x.id,runNative({mode:'integrated',input:x.fixture})]));
 assert.equal(results.combined.summary.changedControls,2);
 assert.equal(results.combined.summary.changedTechnicalFindings,2);
 assert.equal(results.data.summary.changedControls,1);
 assert.equal(results.data.summary.changedTechnicalFindings,1);
 assert.equal(results.model.summary.changedControls,1);
 assert.equal(results.model.summary.changedTechnicalFindings,0);
 assert.equal(results.model.summary.historicalAssessmentsReexecuted,2);
 assert.deepEqual(results.model.affectedSystemIds,['synthetic-A','synthetic-B']);
 assert.notEqual(results.combined.receiptHash,results.data.receiptHash);
 assert.notEqual(results.data.receiptHash,results.model.receiptHash);
});

test('the model-tightening example explicitly does not fabricate a technical failure',()=>{
 const item=scenarioLibrary().find(x=>x.id==='model');
 const result=runNative({mode:'integrated',input:item.fixture});
 assert.equal(result.summary.changedTechnicalFindings,0);
 assert.ok(result.findingsTrace.every(x=>x.recomputedCurrent==='MET'));
 assert.ok(result.findingsTrace.every(x=>x.changedFinding===false));
 assert.equal(result.summary.humanReviewOutstanding,true);
});

test('scenario descriptions and policy clauses are illustrative, not verified federal rules',()=>{
 for(const s of scenarioLibrary()){
  assert.equal(s.synthetic,true);
  assert.ok(s.nameFr.length>8);
  assert.match(s.description,/synthetic|control|threshold|native|re-evaluation/i);
  assert.ok(s.fixture.policy.after.clauses.every(c=>c.text.startsWith('Synthetic tolerance:')));
 }
});
