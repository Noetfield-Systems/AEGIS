import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {runNative} from '../assurance/native.mjs';
import {runGovernedLifecycle,approvalStatement} from '../assurance/governed-lifecycle.mjs';
import {governedFixture} from '../fixtures/governed.mjs';
import {getSourceRegistry} from '../assurance/source-registry.mjs';
import {contentHash} from '../assurance/replay.mjs';
import {evaluateData,evaluateClassifier,evaluateOutputs} from '../assurance/native.mjs';

const evaluators={data:evaluateData,classifier:evaluateClassifier,output:evaluateOutputs};
const execute=(x,anchors=[])=>runGovernedLifecycle(x,evaluators,anchors);
function signFixture(input,ids=['C-DATA','C-OUTPUT']){
 const {publicKey,privateKey}=generateKeyPairSync('ed25519');
 const anchor={id:'test-reviewer-1',publicKeyPem:publicKey.export({format:'pem',type:'spki'}),allowedSourceIds:[input.scenario.policy.sourceId]};
 const source={sourceId:input.scenario.policy.sourceId,version:input.scenario.policy.after.version,digest:input.scenario.policy.after.sourceDigest};
 for(const id of ids){
  const mapping=input.scenario.policy.mappings.find(m=>m.id===id);
  const statement=approvalStatement(mapping,source);
  input.approvals.push({
   mappingId:mapping.id,keyId:anchor.id,signedOn:'2026-11-16',validUntil:'2026-12-31',decision:'APPROVE',
   signature:sign(null,Buffer.from(JSON.stringify(statement)),privateKey).toString('base64')
  });
 }
 return anchor;
}
test('official registry contains anchored checked excerpts and never claims a full document capture',()=>{
 const catalog=getSourceRegistry();
 assert.equal(catalog.sources.length,6);
 assert.ok(catalog.excerptReferences.length>=2);
 assert.equal(catalog.sourceVersionAttested,false);
 assert.equal(catalog.approvedRegulatoryMappings,0);
 for(const x of catalog.excerptReferences)assert.equal(x.excerptSha256,contentHash(x.excerpt));
 for(const s of catalog.sources)assert.equal(s.publishedVersion,null);
});

test('without trusted review keys: historical native replay runs but future version stays unsigned and pending',()=>{
 const input=governedFixture(),before=structuredClone(input);
 const a=execute(input),b=execute(input);
 assert.deepEqual(a,b,'deterministic receipt');
 assert.deepEqual(input,before,'source and historical assessment records not mutated');
 assert.equal(a.completedNativeReplays,1);
 assert.equal(a.regulatoryStatus,'UNABLE_TO_DETERMINE');
 assert.equal(a.iscEvidenceCredited,false);
 assert.deepEqual(a.affectedSystemIds,['synthetic-A']);
 assert.deepEqual(a.unaffectedSystemIds,['synthetic-B']);
 assert.equal(a.findings.length,2);
 assert.deepEqual(a.findings.map(f=>f.recomputedCurrent),['NOT_MET','NOT_MET']);
 assert.equal(a.lifecyclePlans.find(w=>w.phase==='COMPLETED').decision.originalPreserved,true);
 assert.equal(a.lifecyclePlans.find(w=>w.phase==='IN_PROGRESS').decision.selectedPolicyVersion,null);
 assert.equal(a.lifecyclePlans.find(w=>w.phase==='PLANNED').decision.selectedPolicyVersion,null);
 assert.ok(a.technicalApprovalChecks.every(x=>x.status==='PENDING_SIGNATURE'));
 assert.match(a.receiptHash,/^sha256:[a-f0-9]{64}$/);
});

test('explicitly trusted Ed25519 key signs two synthetic control mappings; planned and active select new version',()=>{
 const input=governedFixture(),anchor=signFixture(input);
 const out=execute(input,[anchor]);
 assert.deepEqual(out.technicalApprovalChecks.map(x=>x.status),[
  'TECHNICAL_MAPPING_SIGNATURE_VALID','PENDING_SIGNATURE','TECHNICAL_MAPPING_SIGNATURE_VALID'
 ]);
 const active=out.lifecyclePlans.find(x=>x.phase==='IN_PROGRESS').decision;
 const future=out.lifecyclePlans.find(x=>x.phase==='PLANNED').decision;
 assert.equal(active.selectedPolicyVersion,input.scenario.policy.after.version);
 assert.equal(active.nativeEvaluationRun,false);
 assert.equal(future.selectedPolicyVersion,input.scenario.policy.after.version);
 assert.equal(future.nativeEvaluationRun,false);
 assert.equal(out.regulatoryStatus,'UNABLE_TO_DETERMINE');
 assert.equal(out.officialSourceContentVerified,false);
 assert.equal(out.independentHumanReviewVerified,false);
});

test('signed controls cannot be self-authorized by client-provided public key',()=>{
 const input=governedFixture(),anchor=signFixture(input);
 const out=execute(input,[]);
 assert.ok(out.technicalApprovalChecks.every(x=>x.status!=='TECHNICAL_MAPPING_SIGNATURE_VALID'));
 const swapped={...anchor,publicKeyPem:generateKeyPairSync('ed25519').publicKey.export({type:'spki',format:'pem'})};
 assert.ok(execute(input,[swapped]).technicalApprovalChecks.every(x=>x.status!=='TECHNICAL_MAPPING_SIGNATURE_VALID'));
});

test('a changed source digest invalidates signature, even if it remains a valid-looking SHA-256',()=>{
 const input=governedFixture(),anchor=signFixture(input);
 input.scenario.policy.after.sourceDigest='sha256:'+'f'.repeat(64);
 const out=execute(input,[anchor]);
 assert.ok(out.technicalApprovalChecks.every(x=>x.status!=='TECHNICAL_MAPPING_SIGNATURE_VALID'));
 assert.equal(out.lifecyclePlans.find(x=>x.phase==='PLANNED').decision.selectedPolicyVersion,null);
});

test('expired or tampered evidence cannot generate a favorable technical finding',()=>{
 const input=governedFixture();
 input.scenario.replay.systems[0].evidence['C-DATA'].validUntil='2026-11-17';
 const out=execute(input);
 assert.equal(out.expiredEvidence.length,1);
 assert.equal(out.findings.find(f=>f.controlId==='C-DATA').recomputedCurrent,'UNABLE_TO_DETERMINE');
 assert.equal(input.scenario.replay.systems[0].evidence['C-DATA'].status,'VALID');
});

test('an earlier planned date selects the prior effective policy version without treating future work as historical',()=>{
 const input=governedFixture();
 input.scenario.policy.workItems.find(x=>x.id==='planned-A').scheduledFor='2026-11-14';
 const out=execute(input);
 const plan=out.lifecyclePlans.find(x=>x.phase==='PLANNED').decision;
 assert.equal(plan.selectedPolicyVersion,input.scenario.policy.before.version);
 assert.equal(plan.nativeEvaluationRun,false);
 assert.equal(out.completedNativeReplays,1);
});

test('invalid schedule, retroactive version assignment and duplicate technical approvals fail safely',()=>{
 const a=governedFixture();a.scenario.policy.workItems.find(w=>w.phase==='PLANNED').scheduledFor='not-a-date';
 assert.throws(()=>execute(a),/future scheduledFor/);
 const b=governedFixture();b.afterEffectiveOn='2026-12-01';
 assert.throws(()=>execute(b),/cannot govern the past/);
 const c=governedFixture();c.scenario.policy.workItems.find(w=>w.phase==='IN_PROGRESS').policyVersion='unknown';
 assert.throws(()=>execute(c),/unknown policy version/);
});

test('the authenticated native dispatcher uses only server-supplied trust, and no request-side trust field',()=>{
 const input=governedFixture(),anchor=signFixture(input);
 const result=runNative({mode:'governed-lifecycle',input, trustedReviewerKeys:[anchor]});
 assert.ok(result.technicalApprovalChecks.every(x=>x.status!=='TECHNICAL_MAPPING_SIGNATURE_VALID'));
 const trusted=runNative({mode:'governed-lifecycle',input},{trustedReviewerKeys:[anchor]});
 assert.ok(trusted.technicalApprovalChecks.some(x=>x.status==='TECHNICAL_MAPPING_SIGNATURE_VALID'));
});
