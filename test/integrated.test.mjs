import test from 'node:test';
import assert from 'node:assert/strict';
import {runNative} from '../assurance/native.mjs';
import {integratedFixture} from '../fixtures/integrated.mjs';
import {benchmarkImpact,evaluateCounterfactual} from '../assurance/benchmark.mjs';
import {emptyReviewJournal,appendCase,appendReview,verifyReviewJournal,renderReviewReport} from '../assurance/review-journal.mjs';

const integrated=()=>runNative({mode:'integrated',input:integratedFixture()});

test('one end-to-end scenario connects source changes to authentic first-party recomputation',()=>{
 const input=integratedFixture(),copy=structuredClone(input);
 const a=integrated(),b=integrated();
 assert.deepEqual(a,b);
 assert.deepEqual(input,copy,'source fixture is preserved');
 assert.equal(a.kind,'integrated-ai-assurance-simulation');
 assert.equal(a.iscEvidenceCredited,false);
 assert.equal(a.summary.changedClauses,2);
 assert.equal(a.summary.changedControls,2);
 assert.equal(a.summary.affectedSystems,1);
 assert.equal(a.summary.historicalAssessmentsReexecuted,1);
 assert.equal(a.summary.pendingActiveOrPlanned,2);
 assert.equal(a.summary.changedTechnicalFindings,2);
 assert.equal(a.summary.regulatoryComplianceStatus,'UNABLE_TO_DETERMINE');
 assert.deepEqual(a.affectedSystemIds,['synthetic-A']);
 assert.deepEqual(a.unaffectedSystemIds,['synthetic-B']);
 assert.deepEqual(a.findingsTrace.map(c=>c.recomputedCurrent),['NOT_MET','NOT_MET']);
 assert.ok(a.findingsTrace.every(c=>c.reviewStatus==='PENDING_AUTHORIZED_REVIEW'));
 assert.match(a.receiptHash,/^sha256:[a-f0-9]{64}$/);
});

test('policy and native mismatch is rejected, not converted to a passing claim',()=>{
 const x=integratedFixture();x.policy.mappings[0].threshold=0.2;
 assert.throws(()=>runNative({mode:'integrated',input:x}),/mismatches native evaluator contract/);
 const y=integratedFixture();y.policy.after.version='fake-revision';
 assert.throws(()=>runNative({mode:'integrated',input:y}),/version mismatch/);
 const z=integratedFixture();z.policy.systems[0].controlIds=['C-MODEL'];
 assert.throws(()=>runNative({mode:'integrated',input:z}),/affected systems differ/);
});

test('inconsistent completed work queue cannot silently omit historical reassessment',()=>{
 const x=integratedFixture();x.policy.workItems=x.policy.workItems.filter(w=>w.id!=='assessment-A-v1');
 assert.throws(()=>runNative({mode:'integrated',input:x}),/historical assessment not in completed work queue/);
});

test('tampered historic evidence cannot obtain a MET when the strict evaluator runs',()=>{
 const x=integratedFixture();
 x.replay.systems[0].evidence['C-DATA'].fixtureHash='sha256:untrusted';
 const out=runNative({mode:'integrated',input:x});
 assert.equal(out.findingsTrace.find(c=>c.controlId==='C-DATA').recomputedCurrent,'UNABLE_TO_DETERMINE');
 assert.equal(out.iscEvidenceCredited,false);
});

test('controlled, synthetic policy-impact benchmark reports TP/FP/TN/FN and 95% Wilson intervals',()=>{
 const input={cases:[
  {id:'1',referenceAffected:true,predictedAffected:true},
  {id:'2',referenceAffected:true,predictedAffected:true},
  {id:'3',referenceAffected:true,predictedAffected:false},
  {id:'4',referenceAffected:false,predictedAffected:true},
  {id:'5',referenceAffected:false,predictedAffected:false}
 ]};
 const out=benchmarkImpact(input);
 assert.deepEqual([out.results.tp,out.results.fp,out.results.tn,out.results.fn],[2,1,1,1]);
 assert.equal(out.results.precision,0.666667);
 assert.equal(out.results.recall,0.666667);
 assert.ok(out.results.precisionWilson95.lower<out.results.precision);
 assert.ok(out.results.recallWilson95.upper>out.results.recall);
 assert.equal(out.independentGroundTruthVerified,false);
 assert.equal(out.notACommercialComparison,true);
 assert.deepEqual(out,runNative({mode:'impact-benchmark',input}));
});

test('undefined precision and recall are not converted to one',()=>{
 const out=benchmarkImpact({cases:[{id:'a',referenceAffected:false,predictedAffected:false}]});
 assert.equal(out.results.precision,null);
 assert.equal(out.results.recall,null);
 assert.equal(out.results.precisionWilson95,null);
});

test('deterministic decision simulation preserves original and reports changed decisions',()=>{
 const input={scenarioId:'S1',proposedThreshold:0.9,decisions:[
  {id:'d1',score:0.8,historicalThreshold:0.7,recordedDecision:'APPROVE'},
  {id:'d2',score:0.6,historicalThreshold:0.7,recordedDecision:'REVIEW'}
 ]};
 const out=evaluateCounterfactual(input);
 assert.equal(out.changedCount,1);
 assert.equal(out.decisions[0].hypotheticalDecision,'REVIEW');
 assert.equal(out.decisions[1].changed,false);
 assert.equal(out.causalImpactClaimed,false);
 assert.deepEqual(out,runNative({mode:'decision-what-if',input}));
});

test('review journal stores only case summary + operator assertions with verifiable hash chain',()=>{
 const caseResult=integrated(),now='2026-11-18T18:00:00.000Z';
 const first=appendCase(emptyReviewJournal(),caseResult,now);
 const identical=appendCase(first.journal,caseResult,now);
 assert.equal(identical.created,false);
 assert.equal(identical.journal.cases.length,1);
 assert.ok(!JSON.stringify(first.journal).includes('approved'), 'raw fixture should not be in the journal');
 const reviewed=appendReview(first.journal,{
  caseReceiptHash:caseResult.receiptHash,decision:'REQUEST_CHANGES',
  reviewerDisplayName:'Internal Reviewer',reason:'Needs independent federal policy evaluation'
 },'local-admin',now);
 assert.equal(reviewed.event.independentReviewClaimed,false);
 assert.equal(reviewed.event.scope,'INTERNAL_OPERATOR_COMMENT_ONLY');
 assert.equal(verifyReviewJournal(reviewed.journal),true);
 const tampered=structuredClone(reviewed.journal);tampered.events[0].decision='APPROVE';
 assert.throws(()=>verifyReviewJournal(tampered),/chain mismatch/);
 assert.throws(()=>appendReview(first.journal,{caseReceiptHash:caseResult.receiptHash,decision:'APPROVE',reviewerDisplayName:'Q',reason:'Approved now'},'local-admin',now),/review reason/);
 assert.throws(()=>appendReview(first.journal,{caseReceiptHash:caseResult.receiptHash,decision:'APPROVE',reviewerDisplayName:'Fake',reason:'Looks good enough for me'},'external-user',now),/not authorized/);
});

test('bilingual report escapes reviewer-controlled HTML and does not claim TRL or independence',()=>{
 const caseResult=integrated();
 const first=appendCase(emptyReviewJournal(),caseResult,'2026-11-18T18:00:00Z');
 const reviewed=appendReview(first.journal,{
  caseReceiptHash:caseResult.receiptHash,decision:'REJECT',
  reviewerDisplayName:'<script>alert(1)</script>',
  reason:'Requires evidence before any official decision'
 },'local-admin','2026-11-18T18:01:00Z');
 const en=renderReviewReport(reviewed.journal,'en'),fr=renderReviewReport(reviewed.journal,'fr');
 assert.match(en,/lang="en-CA"/);assert.match(fr,/lang="fr-CA"/);
 assert.match(fr,/Rapport|Révision interne/);
 assert.doesNotMatch(en,/<script>alert/);assert.match(en,/&lt;script&gt;/);
 assert.throws(()=>renderReviewReport(reviewed.journal,'fa'),/report locale/);
});
