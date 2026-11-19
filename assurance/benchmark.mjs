/** Metric-only benchmark for independently-labelled data, when such data is actually supplied.
 * No input labeling is accepted as independently verified merely because its caller says so.
 */
import {contentHash} from './replay.mjs';

function wilson(successes,total){
 if(total===0)return null;
 const z=1.95996398454,p=successes/total,z2=z*z,den=1+z2/total;
 const center=(p+z2/(2*total))/den;
 const radius=z*Math.sqrt(p*(1-p)/total+z2/(4*total*total))/den;
 return {lower:Number(Math.max(0,center-radius).toFixed(6)),upper:Number(Math.min(1,center+radius).toFixed(6))};
}
const div=(n,d)=>d?Number((n/d).toFixed(6)):null;
const obj=(x,name)=>{if(!x||typeof x!=='object'||Array.isArray(x))throw new TypeError(name+' must be an object');return x};

export function benchmarkImpact(input){
 obj(input,'benchmark input');
 const cases=input.cases;
 if(!Array.isArray(cases)||cases.length>5000||cases.length===0)throw new TypeError('benchmark requires 1 to 5000 labelled cases');
 const ids=new Set();let tp=0,fp=0,tn=0,fn=0;
 for(const c of cases){
  obj(c,'case');
  if(typeof c.id!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,79}$/.test(c.id)||ids.has(c.id))throw new TypeError('unique case ID required');
  ids.add(c.id);
  if(typeof c.referenceAffected!=='boolean'||typeof c.predictedAffected!=='boolean')throw new TypeError('reference and prediction must be booleans');
  if(c.referenceAffected&&c.predictedAffected)tp++;
  else if(!c.referenceAffected&&c.predictedAffected)fp++;
  else if(c.referenceAffected)fn++;
  else tn++;
 }
 const precision=div(tp,tp+fp),recall=div(tp,tp+fn),specificity=div(tn,tn+fp);
 const results={
  sampleCount:cases.length,tp,fp,tn,fn,precision,recall,specificity,
  precisionWilson95:wilson(tp,tp+fp),recallWilson95:wilson(tp,tp+fn),
  accuracy:div(tp+tn,cases.length)
 };
 const out={
  kind:'impact-reference-metric-report',methodVersion:'impact-benchmark-v0.1.0',
  experimentOnly:true,independentGroundTruthVerified:false,
  notACommercialComparison:true,notATRLDetermination:true,
  labelProvenance:input.labelProvenance||'USER_SUPPLIED_UNVERIFIED',
  results,sourceInputHash:contentHash(input),
  limitations:[
   'Reference labels are supplied by the caller; this function does not independently verify them.',
   'Wilson score intervals assume independent Bernoulli observations and do not fix selection bias.',
   'No external product, manual baseline or deployed representative environment was benchmarked.'
  ]
 };
 return {...out,receiptHash:contentHash(out)};
}
export function evaluateCounterfactual(input){
 obj(input,'counterfactual input');
 if(!Array.isArray(input.decisions)||!input.decisions.length||input.decisions.length>300)throw new TypeError('decisions must contain 1–300 records');
 const th=input.proposedThreshold;
 if(typeof th!=='number'||!Number.isFinite(th)||th<0||th>1)throw new TypeError('proposed threshold must be in [0,1]');
 const seen=new Set();
 const changes=input.decisions.map(d=>{
  obj(d,'decision');
  if(typeof d.id!=='string'||!/^[a-zA-Z0-9._:-]{1,80}$/.test(d.id)||seen.has(d.id))throw new TypeError('unique decision id required');
  seen.add(d.id);
  if(typeof d.score!=='number'||!Number.isFinite(d.score)||d.score<0||d.score>1)throw new TypeError('bounded score required');
  if(typeof d.historicalThreshold!=='number'||!Number.isFinite(d.historicalThreshold)||d.historicalThreshold<0||d.historicalThreshold>1)throw new TypeError('historical threshold required');
  if(!['APPROVE','REVIEW'].includes(d.recordedDecision))throw new TypeError('decision must be APPROVE or REVIEW');
  const recomputedOld=d.score>=d.historicalThreshold?'APPROVE':'REVIEW';
  const hypothetical=d.score>=th?'APPROVE':'REVIEW';
  return {
   decisionId:d.id,originalRecorded:d.recordedDecision,oldRuleRecomputed:recomputedOld,
   historicalInconsistency:d.recordedDecision!==recomputedOld,
   hypotheticalDecision:hypothetical,changed:d.recordedDecision!==hypothetical,
   score:d.score,oldThreshold:d.historicalThreshold,newThreshold:th,
   requiresHumanReview:true
  };
 });
 const out={
  kind:'deterministic-decision-what-if',methodVersion:'decision-simulation-v0.1.0',
  scenarioId:input.scenarioId??'hypothetical-scenario',
  experimental:true,causalImpactClaimed:false,iscEvidenceCredited:false,
  sourceInputHash:contentHash(input),changedCount:changes.filter(x=>x.changed).length,
  decisions:changes,reviewRequired:true,
  limitations:[
   'Threshold simulation only; not a causal effect estimate or a replay of a deployed model.',
   'All recommendations require an accountable human reviewer and validated decision context.'
  ]
 };
 return {...out,receiptHash:contentHash(out)};
}
