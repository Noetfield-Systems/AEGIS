/**
 * AEGIS impact experiment. Predictions come from the actual first-party policy compiler,
 * never from a caller-supplied predictedAffected field.
 * Reference labels remain caller-provided and UNVERIFIED, not ground-truth certification.
 */
import {compilePolicyImpact} from './policy.mjs';
import {benchmarkImpact} from './benchmark.mjs';
import {contentHash} from './replay.mjs';

const fail=m=>{throw new TypeError(m)};
const id=(v,n)=>{if(typeof v!=='string'||!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(v))fail(n+' invalid');return v};
export function evaluateImpactExperiment(input){
 if(!input||typeof input!=='object'||Array.isArray(input))fail('benchmark must be an object');
 id(input.datasetId,'datasetId');
 if(!Array.isArray(input.cases)||input.cases.length<2||input.cases.length>40)fail('benchmark requires 2–40 source-labelled cases');
 const ids=new Set(),computed=[];
 for(const item of input.cases){
  if(!item||typeof item!=='object'||Array.isArray(item))fail('case must be an object');
  id(item.id,'case.id');id(item.systemId,'case.systemId');
  if(ids.has(item.id))fail('duplicate benchmark case id');ids.add(item.id);
  if(typeof item.referenceAffected!=='boolean')fail('referenceAffected requires a boolean');
  if(!item.policyInput||typeof item.policyInput!=='object')fail('policyInput is required');
  const impact=compilePolicyImpact(item.policyInput);
  if(!item.policyInput.systems.some(s=>s.id===item.systemId))fail('case references an unknown system');
  const predictedAffected=impact.impactedSystems.some(s=>s.systemId===item.systemId);
  computed.push({
   id:item.id,systemId:item.systemId,sourceId:impact.source.id,
   referenceAffected:item.referenceAffected,predictedAffected,
   matchesReference:item.referenceAffected===predictedAffected,
   policyImpactReceipt:impact.receiptHash,
   policyBefore:impact.sourceVersionBefore,policyAfter:impact.sourceVersionAfter,
   sourceInputHash:impact.sourceInputHash
  });
 }
 const metrics=benchmarkImpact({
  cases:computed.map(c=>({id:c.id,referenceAffected:c.referenceAffected,predictedAffected:c.predictedAffected})),
  labelProvenance:'CALLER_SUPPLIED_NOT_INDEPENDENTLY_VERIFIED'
 });
 const output={
  kind:'compiled-policy-impact-benchmark',
  methodVersion:'impact-compiler-experiment-v0.1.0',
  datasetId:input.datasetId,
  sourceInputHash:contentHash(input),
  caseCount:computed.length,
  predictions:computed,
  metrics:metrics.results,
  metricReceiptHash:metrics.receiptHash,
  benchmarkMethod:'actual policy compiler impact selection compared against separately supplied boolean labels',
  referenceLabelsIndependentlyVerified:false,
  externalCompetitiveBenchmark:false,
  representativeEnvironmentVerified:false,
  trl5EvidenceEstablished:false,
  iscEvidenceCredited:false,
  limitations:[
   'All reference labels are caller-supplied; no independent assessor or blind ground-truth process is implied.',
   'A synthetic test collection cannot validate performance on unseen production policy updates.',
   'Confidence intervals assume independent examples; correlated clauses or model decisions can violate this assumption.',
   'No manual process or commercial competitor was tested in comparable conditions.'
  ]
 };
 return {...output,receiptHash:contentHash(output)};
}
