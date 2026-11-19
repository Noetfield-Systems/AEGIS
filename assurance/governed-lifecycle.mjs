/**
 * AEGIS-103 reviewed policy lifecycle. Leverages the existing integrated Golden Replay,
 * does not replace it. Reviewer signatures authenticate a narrowly scoped *technical*
 * mapping assertion when configured trusted keys exist. They do NOT authenticate
 * governmental source bytes, legal applicability or an independent human evaluation.
 */
import {verify as verifySignature} from 'node:crypto';
import {runIntegratedAssurance} from './integrated.mjs';
import {contentHash} from './replay.mjs';

const fail=x=>{throw new TypeError(x)};
const obj=(x,label)=>{if(!x||typeof x!=='object'||Array.isArray(x))fail(label+' must be an object');return x};
const id=(x,label)=>{if(typeof x!=='string'||!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(x))fail(label+' invalid');return x};
const date=(x,label)=>{if(typeof x!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x)||Number.isNaN(Date.parse(x))||new Date(x+'T00:00:00Z').toISOString().slice(0,10)!==x)fail(label+' requires a valid ISO date');return x};
const digest=x=>typeof x==='string'&&/^sha256:[a-f0-9]{64}$/.test(x);
const uniq=(xs,label)=>{if(new Set(xs).size!==xs.length)fail(label+' contains duplicates')};
const safeBase64=x=>typeof x==='string'&&/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(x)&&x.length>=80&&x.length<=200;
const sort=(xs)=>[...xs].sort();

/** Publicly defined message signed by a specifically trusted technical-policy reviewer. */
export function approvalStatement(mapping,source){
 obj(mapping,'mapping');obj(source,'policy snapshot');
 return {
  audience:'AEGIS_POLICY_MAPPING_REVIEW_V1',
  sourceId:id(source.sourceId,'sourceId'),
  version:id(source.version,'source.version'),
  digest:source.digest,
  mappingId:id(mapping.id,'mapping.id'),
  clauseId:id(mapping.clauseId,'mapping.clauseId'),
  mappingHash:contentHash(mapping),
  reviewScope:'TECHNICAL_MAPPING_ONLY'
 };
}
function checkSignedMapping(mapping,source,approvals,trust,asOf){
 const signed=approvals.filter(x=>x.mappingId===mapping.id);
 if(signed.length===0)return {status:'PENDING_SIGNATURE',mappingId:mapping.id};
 for(const item of signed){
  obj(item,'approval');id(item.keyId,'approval.keyId');
  const anchor=trust.find(x=>x.id===item.keyId);
  if(!anchor)continue;
  if(!anchor.publicKeyPem||!Array.isArray(anchor.allowedSourceIds)||!anchor.allowedSourceIds.includes(source.sourceId))continue;
  if(!date(item.signedOn,'approval.signedOn')||!date(item.validUntil,'approval.validUntil'))continue;
  if(asOf<item.signedOn||asOf>item.validUntil)continue;
  if(item.decision!=='APPROVE')continue;
  if(!safeBase64(item.signature))continue;
  const statement=approvalStatement(mapping,source);
  if(!digest(statement.digest))fail('policy digest must be a SHA-256 digest');
  try{
   if(verifySignature(null,Buffer.from(JSON.stringify(statement)),anchor.publicKeyPem,Buffer.from(item.signature,'base64')))
    return {status:'TECHNICAL_MAPPING_SIGNATURE_VALID',mappingId:mapping.id,reviewerKeyId:item.keyId,reviewedOn:item.signedOn,signatureEvidenceHash:contentHash(item)};
  }catch{ /* malformed key or signature is not an approval */ }
 }
 return {status:'NO_VALID_TRUSTED_REVIEW',mappingId:mapping.id};
}
function cleanReplayForExpiredEvidence(replay,asOf){
 const output=structuredClone(replay),issues=[];
 for(const system of output.systems||[]){
  for(const [controlId,evidence] of Object.entries(system.evidence||{})){
   if(!evidence||!Object.hasOwn(evidence,'validUntil'))continue;
   const expiry=date(evidence.validUntil,'evidence.validUntil');
   if(expiry<asOf){
    evidence.status='EXPIRED';
    issues.push({systemId:system.id,controlId,expiredOn:expiry});
   }
  }
 }
 return {replay:output,issues};
}
export function runGovernedLifecycle(input,evaluators,trust=[]){
 obj(input,'governed lifecycle');
 obj(evaluators,'evaluators');
 if(!Array.isArray(trust)||trust.length>30)fail('trusted reviewer keys must be server-configured');
 const asOf=date(input.asOf,'asOf'),afterEffectiveOn=date(input.afterEffectiveOn,'afterEffectiveOn');
 const caseInput=obj(input.scenario,'scenario'),policy=obj(caseInput.policy,'policy'),replay=obj(caseInput.replay,'replay');
 if(asOf<afterEffectiveOn)fail('new version cannot govern the past before its effective date');
 if(!Array.isArray(input.approvals)||input.approvals.length>120)fail('approvals must be an array');
 const source={
  sourceId:policy.sourceId,version:policy.after.version,digest:policy.after.sourceDigest
 };
 if(!digest(source.digest))fail('source digest must be SHA-256');
 const ids=policy.mappings.map(m=>id(m.id,'mapping.id'));uniq(ids,'mappings');
 const approvalChecks=policy.mappings
  .filter(m=>replay.after.controls.some(c=>c.id===m.id))
  .map(m=>checkSignedMapping(m,source,input.approvals,trust,asOf))
  .sort((a,b)=>a.mappingId.localeCompare(b.mappingId));
 const approved=new Set(approvalChecks.filter(x=>x.status==='TECHNICAL_MAPPING_SIGNATURE_VALID').map(x=>x.mappingId));
 const {replay:checkedReplay,issues:expiredEvidence}=cleanReplayForExpiredEvidence(replay,asOf);
 const calculation=runIntegratedAssurance({...caseInput,replay:checkedReplay},evaluators);
 const affectedControls=new Map(calculation.reassessmentQueue.map(q=>[q.workItemId,q]));
 const workPlans=[];
 for(const w of policy.workItems){
  obj(w,'workItem');
  const affected=affectedControls.get(w.id);
  if(!affected)continue;
  const related=calculation.findingsTrace.filter(x=>x.assessmentId===w.id);
  const controlIds=policy.systems.find(s=>s.id===w.systemId)?.controlIds.filter(x=>approved.has(x))||[];
  const changing=policy.systems.find(s=>s.id===w.systemId)?.controlIds.filter(x=>calculation.findingsTrace.some(f=>f.controlId===x))||[];
  const technicallyReviewed=changing.length>0&&changing.every(x=>approved.has(x));
  let selection=null,action=affected.action;
  if(w.phase==='COMPLETED'){
   selection={selectedPolicyVersion:policy.after.version,replayPerformed:true,approvalGatePassed:technicallyReviewed,originalPreserved:true,technicalFindings:related.map(x=>x.recomputedCurrent)};
  }else if(w.phase==='IN_PROGRESS'){
   const previous=w.policyVersion??policy.before.version;
   if(![policy.before.version,policy.after.version].includes(previous))fail('active assessment references unknown policy version');
   selection={selectedPolicyVersion:technicallyReviewed?policy.after.version:null,previousPolicyVersion:previous,reassessmentRequired:previous!==policy.after.version,authorizationStatus:technicallyReviewed?'SIGNED_TECHNICAL_MAPPING':'PENDING_REVIEW',nativeEvaluationRun:false};
  }else if(w.phase==='PLANNED'){
   const scheduledFor=date(w.scheduledFor,'future scheduledFor');
   selection={selectedPolicyVersion:scheduledFor<afterEffectiveOn?policy.before.version:(technicallyReviewed?policy.after.version:null),scheduledFor,selectionReason:scheduledFor<afterEffectiveOn?'PRIOR_VERSION_EFFECTIVE_ON_SCHEDULE':'NEW_VERSION_IF_SIGNED_MAPPING',nativeEvaluationRun:false};
  }else fail('unsupported work item phase');
  workPlans.push({workItemId:w.id,systemId:w.systemId,phase:w.phase,action,approvedControlIds:sort(controlIds),decision:selection,reviewRequired:true});
 }
 const findings=calculation.findingsTrace.map(f=>({...f,
  technicalReviewStatus:approved.has(f.controlId)?'SIGNED_MAPPING_ONLY':'UNREVIEWED_MAPPING',
  complianceFinding:'UNABLE_TO_DETERMINE'
 }));
 const result={
  kind:'governed-lifecycle-simulation',methodVersion:'aegis-governed-lifecycle-v0.1.0',
  scenarioId:caseInput.scenarioId,asOf,afterEffectiveOn,
  policySourceId:policy.sourceId,policyVersionBefore:policy.before.version,policyVersionAfter:policy.after.version,
  officialSourceContentVerified:false,officialApplicabilityVerified:false,
  technicalApprovalChecks:approvalChecks,
  affectedSystemIds:calculation.affectedSystemIds,unaffectedSystemIds:calculation.unaffectedSystemIds,
  expiredEvidence,completedNativeReplays:calculation.summary.historicalAssessmentsReexecuted,
  lifecyclePlans:workPlans,findings,
  priorReplayReceipt:calculation.receiptHash,
  regulatoryStatus:'UNABLE_TO_DETERMINE',iscEvidenceCredited:false,
  independentHumanReviewVerified:false,
  limitations:[
   'Signed approvals concern technical metric mappings only; policy applicability and original official source bytes are not independently verified.',
   'Ongoing and future tasks receive an explicit plan/version selection; their native assessments have NOT been executed.',
   'Completed findings are provisional native measurements and must not be interpreted as federal compliance.'
  ],
  sourceInputHash:contentHash(input)
 };
 return {...result,receiptHash:contentHash(result)};
}
