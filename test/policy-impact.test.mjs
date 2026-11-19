import test from 'node:test';
import assert from 'node:assert/strict';
import {compilePolicyImpact,FEDERAL_SOURCES} from '../assurance/policy.mjs';
import {runNative} from '../assurance/native.mjs';
import {policyImpactFixture} from '../fixtures/policy-impact.mjs';

test('five official-source references are catalogued, not falsely certified as source snapshots',()=>{
 assert.equal(FEDERAL_SOURCES.length,5);
 assert.deepEqual(FEDERAL_SOURCES.map(s=>s.id),['POLICY_SERVICE_DIGITAL','DIRECTIVE_ADM','AIA','AI_STRATEGY','AI_ETHICS']);
 for(const s of FEDERAL_SOURCES){
  assert.ok(s.url.startsWith('https://'));
  assert.equal(s.sourceStatus,'URL_REFERENCE_ONLY');
 }
});

test('compilation is stable, source-preserving and selects only changed controls and systems',()=>{
 const input=policyImpactFixture(),copy=structuredClone(input);
 const a=compilePolicyImpact(input),b=compilePolicyImpact(input);
 assert.deepEqual(a,b);assert.deepEqual(input,copy);
 assert.equal(a.kind,'federal-source-impact-proposal');
 assert.equal(a.sourceSnapshotsExternallyVerified,false);
 assert.equal(a.iscEvidenceCredited,false);
 assert.equal(a.decision,'PENDING_HUMAN_REVIEW');
 assert.equal(a.changedClauses.length,1);
 assert.equal(a.changedClauses[0].changeType,'MODIFIED');
 assert.equal(a.changedClauses[0].clauseId,'CLAUSE-REVIEW');
 assert.equal(a.proposedControls.length,1);
 assert.equal(a.proposedControls[0].controlId,'CTRL-REVIEW');
 assert.equal(a.proposedControls[0].isActive,false);
 assert.equal(a.proposedControls[0].complianceFinding,'UNABLE_TO_DETERMINE');
 assert.deepEqual(a.impactedSystems.map(s=>s.systemId),['SIMULATED-DPT-A']);
 assert.deepEqual(a.unaffectedSystemIds,['SIMULATED-DPT-B']);
 assert.match(a.receiptHash,/^sha256:[0-9a-f]{64}$/);
});

test('completed, in-progress and planned work all receive different reassessment actions',()=>{
 const a=runNative({mode:'policy-impact',input:policyImpactFixture()});
 assert.deepEqual(a.reassessmentQueue.map(x=>x.action),[
  'REBASE_AND_REASSESS_BEFORE_APPROVAL',
  'SCHEDULE_HISTORICAL_NATIVE_REPLAY',
  'UPDATE_REQUIREMENTS_BEFORE_START'
 ]);
 assert.ok(a.reassessmentQueue.every(x=>x.reviewRequired));
 assert.equal(a.reassessmentQueue.length,3);
});

test('unchanged policy clause does not trigger reprocessing',()=>{
 const input=policyImpactFixture();
 input.after.clauses[0]={...input.before.clauses[0]};
 const output=compilePolicyImpact(input);
 assert.deepEqual(output.changedClauses,[]);
 assert.deepEqual(output.proposedControls,[]);
 assert.deepEqual(output.reassessmentQueue,[]);
 assert.deepEqual(output.unaffectedSystemIds,['SIMULATED-DPT-A','SIMULATED-DPT-B']);
});

test('added and retired clauses have auditable change types',()=>{
 const input=policyImpactFixture();
 input.after.clauses=input.after.clauses.filter(x=>x.id!=='CLAUSE-REVIEW');
 input.after.clauses.push({id:'CLAUSE-NEW',section:'Synthetic Section 3',text:'New placeholder requirement for isolated testing.'});
 input.mappings.push({id:'CTRL-NEW',clauseId:'CLAUSE-NEW',kind:'data',metric:'duplicateRate',operator:'<=',threshold:0.1,mappingStatus:'PROPOSED'});
 const output=compilePolicyImpact(input);
 assert.deepEqual(output.changedClauses.map(c=>[c.clauseId,c.changeType]),[['CLAUSE-NEW','ADDED'],['CLAUSE-REVIEW','RETIRED']]);
 assert.equal(output.proposedControls.length,2);
});

test('fail-closed if source identity, snapshot digest or mapping provenance is absent',()=>{
 const bad=policyImpactFixture();bad.sourceId='NOT_A_FEDERAL_SOURCE';
 assert.throws(()=>compilePolicyImpact(bad),/unknown federal source/);
 const bad2=policyImpactFixture();bad2.before.sourceDigest='unverified';
 assert.throws(()=>compilePolicyImpact(bad2),/sha256 digest/);
 const bad3=policyImpactFixture();bad3.mappings[0].clauseId='MISSING';
 assert.throws(()=>compilePolicyImpact(bad3),/absent from both versions/);
 const bad4=policyImpactFixture();bad4.mappings[0].mappingStatus='APPROVED';
 assert.throws(()=>compilePolicyImpact(bad4),/must start as PROPOSED/);
});

test('tampered mapping and duplicated system identity are rejected',()=>{
 const input=policyImpactFixture();input.mappings[0].metric='imaginary-pass-score';
 assert.throws(()=>compilePolicyImpact(input),/unsupported first-party native metric/);
 const dup=policyImpactFixture();dup.systems.push({...dup.systems[0]});
 assert.throws(()=>compilePolicyImpact(dup),/duplicate IDs/);
});

test('cannot silently classify a retired or missing control as MET',()=>{
 const input=policyImpactFixture();
 input.after.clauses=[];
 const out=compilePolicyImpact(input);
 assert.equal(out.proposedControls.length,2);
 assert.ok(out.proposedControls.every(p=>p.complianceFinding==='UNABLE_TO_DETERMINE'));
 assert.ok(out.proposedControls.every(p=>p.currentSection===null));
});
