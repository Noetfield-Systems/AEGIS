/**
 * AEGIS integrated, synthetic-only policy -> native reassessment -> provenance workflow.
 * Does not infer legal applicability, award ISC evidence credit, or approve policy mappings.
 */
import {compilePolicyImpact} from './policy.mjs';
import {replayCompleted,contentHash} from './replay.mjs';

const fail=s=>{throw new TypeError(s)};
const checkObj=(x,name)=>{if(!x||typeof x!=='object'||Array.isArray(x))fail(name+' must be an object');return x};
const sorted=a=>[...a].sort();
const same=(a,b)=>JSON.stringify(sorted(a))===JSON.stringify(sorted(b));
const requireId=(v,name)=>{if(typeof v!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,79}$/.test(v))fail(name+' invalid');return v};

export function runIntegratedAssurance(input,evaluators){
 checkObj(input,'integrated input');checkObj(evaluators,'evaluators');
 requireId(input.scenarioId,'scenarioId');
 const policy=checkObj(input.policy,'policy');
 const historical=checkObj(input.replay,'replay');
 if(historical.before?.version!==policy.before?.version||historical.after?.version!==policy.after?.version)fail('policy and replay version mismatch');
 if(!historical.scenarioId||historical.scenarioId!==input.scenarioId)fail('scenario identity mismatch');
 // A caller cannot use unapproved source text to generate authoritative compliance results.
 const impact=compilePolicyImpact(policy);
 const replay=replayCompleted(historical,evaluators);
 const impactedControlIds=impact.proposedControls.map(x=>x.controlId);
 if(!same(impactedControlIds,replay.changedControls))fail('policy-to-replay changed control IDs do not match');
 const policyMap=new Map(policy.mappings.map(m=>[m.id,m]));
 const afterControls=new Map(historical.after.controls.map(c=>[c.id,c]));
 for(const id of impactedControlIds){
  const m=policyMap.get(id),c=afterControls.get(id);
  if(!m||!c||m.kind!==c.kind||m.metric!==c.metric||m.operator!==c.operator||m.threshold!==c.threshold||
      (m.field||null)!==(c.field||null))fail('policy control mapping mismatches native evaluator contract: '+id);
 }
 const impactSystems=impact.impactedSystems.map(s=>s.systemId);
 const replaySystems=replay.affectedSystems.map(s=>s.systemId);
 if(!same(impactSystems,replaySystems))fail('affected systems differ between policy compiler and native replay');
 if(!same(impact.unaffectedSystemIds,replay.unaffectedSystems))fail('unaffected system coverage differs');
 const completedIds=new Set(policy.workItems.filter(w=>w.phase==='COMPLETED').map(w=>w.id));
 for(const a of historical.assessments)if(!completedIds.has(a.id))fail('historical assessment not in completed work queue');
 const impactedAssessments=new Set(replay.assessmentsReplayed.map(a=>a.sourceAssessmentId));
 const queued=impact.reassessmentQueue.filter(a=>a.phase==='COMPLETED').map(a=>a.workItemId);
 if(!same([...impactedAssessments],queued))fail('historical replay does not cover all queued completed assessments');
 const trace=replay.assessmentsReplayed.flatMap(a=>a.controlChanges.map(c=>({
  assessmentId:a.sourceAssessmentId,
  sourceAssessmentHash:a.sourceAssessmentHash,
  controlId:c.controlId,
  sourceClauseId:policyMap.get(c.controlId)?.clauseId??null,
  observedPrevious:c.historicalRecorded,
  recomputedPrevious:c.independentlyRecomputedBefore.finding,
  recomputedCurrent:c.recomputedAfter.finding,
  metricValue:c.recomputedAfter.measurement,
  changedFinding:c.changedFinding,
  evidenceInputHash:c.recomputedAfter.inputHash??null,
  currentSourceDigest:policy.after.sourceDigest,
  reviewStatus:'PENDING_AUTHORIZED_REVIEW'
 })));
 const result={
  kind:'integrated-ai-assurance-simulation',
  methodVersion:'aegis-integrated-v0.1.0',experimental:true,
  syntheticOnly:true,iscEvidenceCredited:false,legalApplicabilityValidated:false,
  scenarioId:input.scenarioId,
  policyImpactHash:impact.receiptHash,nativeReplayHash:replay.receiptHash,
  sourceVersions:{before:policy.before.version,after:policy.after.version},
  affectedSystemIds:sorted(impactSystems),
  unaffectedSystemIds:sorted(impact.unaffectedSystemIds),
  reassessmentQueue:impact.reassessmentQueue,
  findingsTrace:trace,
  summary:{
   changedClauses:impact.changedClauses.length,
   changedControls:impact.proposedControls.length,
   affectedSystems:impactSystems.length,
   historicalAssessmentsReexecuted:replay.assessmentsReplayed.length,
   pendingActiveOrPlanned:impact.reassessmentQueue.filter(q=>q.phase!=='COMPLETED').length,
   changedTechnicalFindings:trace.filter(c=>c.changedFinding).length,
   humanReviewOutstanding:true,
   regulatoryComplianceStatus:'UNABLE_TO_DETERMINE'
  },
  sourceHash:contentHash(input),
  limitations:[
   'Source clauses and policy mappings are synthetic and not legal determinations.',
   'Native technical findings are provisional and never equivalent to approved compliance findings.',
   'The same single-administrator sign-in does not prove independent human review or tenant separation.',
   'A content digest is not an external cryptographic signature or an attestation of policy content.'
  ]
 };
 return {...result,receiptHash:contentHash(result)};
}
