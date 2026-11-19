import test from 'node:test';
import assert from 'node:assert/strict';
import {triageAiaScope} from '../assurance/aia-scope.mjs';
import {runNative} from '../assurance/native.mjs';
const sample=()=>({
 systemId:'synthetic-gc-assessment-01',
 jurisdiction:'FEDERAL_CANADA',
 stage:'PRE_PRODUCTION',
 decisionImpact:'ADMINISTRATIVE_RIGHTS_OR_INTERESTS',
 aiDecisionRole:'SUPPORTS',
 changedAspects:['FUNCTIONALITY'],
 lastAiaReviewAt:'2026-10-31'
});

test('potentially in-scope human-assisted administrative decisions call for authorized review',()=>{
 const input=sample(),before=structuredClone(input);
 const a=triageAiaScope(input),b=triageAiaScope(input);
 assert.deepEqual(a,b);assert.deepEqual(input,before);
 assert.equal(a.inferredTriage,'POTENTIALLY_IN_SCOPE_REQUIRES_REVIEW');
 assert.equal(a.aiaReviewFlag,'SCHEDULE_AUTHORIZED_AIA_REVIEW');
 assert.equal(a.finding,'UNABLE_TO_DETERMINE');
 assert.equal(a.legalApplicabilityConfirmed,false);
 assert.equal(a.sourceInputHash.startsWith('sha256:'),true);
 assert.deepEqual(a,runNative({mode:'aia-scope',input}));
});

test('undeployed research is provisionally out of directive scope, not a compliance pass',()=>{
 const input=sample();input.stage='EXPERIMENTAL_RESEARCH';
 const out=triageAiaScope(input);
 assert.equal(out.inferredTriage,'LIKELY_OUT_OF_SCOPE_REQUIRES_DEPARTMENTAL_CONFIRMATION');
 assert.equal(out.aiaReviewFlag,'NOT_AUTO_SCHEDULED');
 assert.equal(out.finding,'UNABLE_TO_DETERMINE');
});

test('unknown application context must never be auto-declared not applicable',()=>{
 const input=sample();input.decisionImpact='UNKNOWN';
 const out=triageAiaScope(input);
 assert.equal(out.inferredTriage,'UNABLE_TO_DETERMINE');
 assert.equal(out.finding,'UNABLE_TO_DETERMINE');
});

test('non-administrative decision, no system role and non-federal context are conservatively assessed',()=>{
 for(const [field,value] of [['decisionImpact','NON_ADMINISTRATIVE'],['aiDecisionRole','NONE'],['jurisdiction','NON_FEDERAL']]){
  const input=sample();input[field]=value;
  const out=triageAiaScope(input);
  assert.equal(out.inferredTriage,'LIKELY_OUT_OF_SCOPE_REQUIRES_DEPARTMENTAL_CONFIRMATION');
  assert.equal(out.finding,'UNABLE_TO_DETERMINE');
 }
});

test('existing AIA record without described change leaves review cadence for a human',()=>{
 const input=sample();input.changedAspects=[];
 const out=triageAiaScope(input);
 assert.equal(out.aiaReviewFlag,'CHECK_EXISTING_AIA_REVIEW_CADENCE');
});

test('in-scope deployment without a prior AIA record schedules human review',()=>{
 const input=sample();input.stage='PRODUCTION';input.changedAspects=[];input.lastAiaReviewAt=null;
 const out=triageAiaScope(input);
 assert.equal(out.aiaReviewFlag,'SCHEDULE_AUTHORIZED_AIA_REVIEW');
});

test('invalid change assertions, missing values and duplicated change triggers fail',()=>{
 const input=sample();input.changedAspects=['SCOPE','SCOPE'];
 assert.throws(()=>triageAiaScope(input),/duplicate changes/);
 const input2=sample();input2.changedAspects=['NOT_REAL'];
 assert.throws(()=>triageAiaScope(input2),/changedAspects invalid/);
 const input3=sample();input3.aiDecisionRole='IT_DEPENDS';
 assert.throws(()=>triageAiaScope(input3),/aiDecisionRole must be/);
});
