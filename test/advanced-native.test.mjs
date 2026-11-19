import test from 'node:test';
import assert from 'node:assert/strict';
import {runNative} from '../assurance/native.mjs';
import {evaluateDistributionShift,evaluateCalibration,evaluateGroundedClaims} from '../assurance/advanced-native.mjs';
const version={datasetVersion:'synthetic-ds-001',modelVersion:'synthetic-model-001'};
test('distribution shift: identical data yields zero PSI, different distributions yield positive PSI',()=>{
 const fixed={...version,baseline:[0.1,0.3,0.6,0.8],current:[0.1,0.3,0.6,0.8],bins:5,psiThreshold:0.3};
 const same=evaluateDistributionShift(fixed);
 assert.equal(same.metrics.psi,0);assert.equal(same.technicalThresholdSatisfied,true);
 assert.deepEqual(same,runNative({mode:'distribution-shift',input:fixed}));
 const changed=evaluateDistributionShift({...fixed,current:[0.9,0.9,0.9,0.9]});
 assert.ok(changed.metrics.psi>0);
 assert.equal(changed.complianceFinding,'UNABLE_TO_DETERMINE');
 assert.equal(changed.independentlyValidated,false);
 assert.deepEqual(changed,evaluateDistributionShift({...fixed,current:[0.9,0.9,0.9,0.9]}));
});
test('distribution shift: empty baseline returns undefined not false assurance',()=>{
 const result=evaluateDistributionShift({...version,baseline:[],current:[0.2]});
 assert.equal(result.measuredValue,null);assert.equal(result.technicalThresholdSatisfied,null);
 assert.throws(()=>evaluateDistributionShift({...version,baseline:[-1],current:[0.2]}),/bounded/);
});
test('calibration: first-party Brier score and ECE on labelled binary probabilities',()=>{
 const input={...version,probabilities:[0.1,0.9,0.8,0.2],labels:[0,1,1,0],bins:5,brierThreshold:0.1};
 const out=evaluateCalibration(input);
 assert.equal(out.measuredValue,0.025);
 assert.equal(out.metrics.expectedCalibrationError,0.15);
 assert.equal(out.technicalThresholdSatisfied,true);
 assert.equal(out.complianceFinding,'UNABLE_TO_DETERMINE');
 assert.deepEqual(out,runNative({mode:'binary-calibration',input}));
});
test('calibration: missing labels, invalid probabilities and empty datasets fail safely',()=>{
 assert.throws(()=>evaluateCalibration({...version,probabilities:[0.3],labels:[]}),/must match/);
 assert.throws(()=>evaluateCalibration({...version,probabilities:[1.1],labels:[1]}),/bounded/);
 const empty=evaluateCalibration({...version,probabilities:[],labels:[]});
 assert.equal(empty.measuredValue,null);
 assert.equal(empty.technicalThresholdSatisfied,null);
});
test('grounded claims: exact labelled-match and abstention metrics are measured, not semantic claims',()=>{
 const input={...version,cases:[
  {id:'a',referenceFacts:['The filing is complete'],outputClaims:[' the  filing is complete ','Unsupported assertion'],abstained:false},
  {id:'b',referenceFacts:[],outputClaims:[],abstained:true}
 ],maxUnsupportedRate:0.6};
 const out=evaluateGroundedClaims(input);
 assert.equal(out.measuredValue,0.5);
 assert.equal(out.metrics.totalSupported,1);assert.equal(out.metrics.totalUnsupported,1);
 assert.equal(out.metrics.abstentionDecisionAccuracy,1);
 assert.equal(out.technicalThresholdSatisfied,true);
 assert.equal(out.iscEvidenceCredited,false);
 assert.deepEqual(out,runNative({mode:'grounded-claims',input}));
});
test('grounded claims: undefined precision, conflicting abstention and duplications handled',()=>{
 const base={...version,cases:[{id:'a',referenceFacts:[],outputClaims:[],abstained:true}]};
 const out=evaluateGroundedClaims(base);
 assert.equal(out.measuredValue,null);assert.equal(out.metrics.groundedExactClaimPrecision,null);
 assert.throws(()=>evaluateGroundedClaims({...version,cases:[{id:'x',referenceFacts:[],outputClaims:['unverified'],abstained:true}]}),/abstention/);
 assert.throws(()=>evaluateGroundedClaims({...version,cases:[base.cases[0],base.cases[0]]}),/duplicate case/);
});
test('evaluation contract binds dataset/model version and content-derived evidence reference',()=>{
 for(const result of [
  evaluateDistributionShift({...version,baseline:[0.5],current:[0.5]}),
  evaluateCalibration({...version,probabilities:[0.6],labels:[1]}),
  evaluateGroundedClaims({...version,cases:[{id:'z',referenceFacts:['fact'],outputClaims:['fact'],abstained:false}]})
 ]){
  assert.match(result.evaluationId,/^sha256:[0-9a-f]{64}$/);
  assert.match(result.inputHash,/^sha256:[0-9a-f]{64}$/);
  assert.ok(result.generatedEvidenceRef.startsWith('urn:aegis:native:'));
  assert.ok(result.metricDefinition);
  assert.equal(result.datasetVersion,version.datasetVersion);
  assert.equal(result.modelVersion,version.modelVersion);
  assert.equal(result.experimental,true);
 }
});
