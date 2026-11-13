import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateData,evaluateClassifier,evaluateOutputs,replayPolicy,runNative} from '../assurance/native.mjs';
test('data missingness, errors, duplicate and precision are reproducible',()=>{
 const input={schema:{age:'number',active:'boolean'},records:[{age:30,active:true},{age:null,active:false},{age:'42',active:true},{age:30,active:true}]};
 const a=evaluateData(input),b=evaluateData(input);
 assert.deepEqual(a,b);assert.equal(a.metrics.records,4);assert.equal(a.metrics.duplicateCount,1);
 assert.equal(a.metrics.fields.age.missing,1);assert.equal(a.metrics.fields.age.typeErrors,1);
 assert.equal(a.iscEvidenceCredited,false);assert.match(a.inputHash,/^sha256:/);
});
test('empty data has explicitly unknown rates',()=>{
 const r=evaluateData({schema:{age:'number'},records:[]});
 assert.equal(r.metrics.fields.age.missingRate,null);
});
test('classifier confusion matrix and metrics',()=>{
 const r=evaluateClassifier({labels:[1,0,1,0],predictions:[1,1,0,0]});
 assert.deepEqual([r.metrics.tp,r.metrics.tn,r.metrics.fp,r.metrics.fn],[1,1,1,1]);
 assert.equal(r.metrics.accuracy,.5);assert.equal(r.metrics.f1,.5);
});
test('undefined classifier metrics cannot falsely report pass',()=>{
 const r=evaluateClassifier({labels:[],predictions:[]});
 assert.equal(r.metrics.precision,null);assert.equal(r.metrics.recall,null);
 assert.equal(r.metrics.f1,null);
});
test('reject invalid classification input',()=>{
 assert.throws(()=>evaluateClassifier({labels:[1,2],predictions:[1,1]}),/binary/);
 assert.throws(()=>evaluateClassifier({labels:[1],predictions:[]}),/same length/);
});
test('output phrase checks report only deterministic matches and limitations',()=>{
 const r=evaluateOutputs({outputs:['approved','not approved'],requiredPhrases:['approved'],forbiddenPhrases:['not ']});
 assert.equal(r.metrics.passCount,1);assert.equal(r.metrics.passRate,.5);
 assert.equal(r.metrics.findings[1].passedRuleChecks,false);
 assert.ok(r.limitations.some(s=>s.includes('not a semantic')));
});
test('replay invalidates affected historical findings without rewriting them',()=>{
 const input={before:{controls:{P1:'old',P2:'same'}},after:{controls:{P1:'new',P2:'same'}},systems:[{id:'s1',controlIds:['P1']},{id:'s2',controlIds:['P2']}],assessments:[{id:'a1',systemId:'s1',finding:'MET',status:'completed'},{id:'a2',systemId:'s2',finding:'MET',status:'completed'}]};
 const original=structuredClone(input);
 const a=replayPolicy(input);
 assert.deepEqual(input,original);assert.deepEqual(a.metrics.changedControls,['P1']);
 assert.equal(a.metrics.impactedSystems.length,1);assert.deepEqual(a.metrics.unaffectedSystems,['s2']);
 assert.equal(a.metrics.assessmentsNeedingReview[0].originalFinding,'MET');
 assert.equal(a.metrics.assessmentsNeedingReview[0].replayFinding,'UNABLE_TO_DETERMINE');
 assert.equal(a.metrics.assessmentsNeedingReview[0].reviewRequired,true);
});
test('API dispatcher does not present native experiment as verified ISC proof',()=>{
 const r=runNative({mode:'classifier',input:{labels:[1,0],predictions:[1,0]}});
 assert.equal(r.experimental,true);assert.equal(r.iscEvidenceCredited,false);
 assert.throws(()=>runNative({mode:'bad',input:{}}),/mode must/);
});
