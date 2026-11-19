/** Synthetic policy-change examples, with two deliberate reference-label disagreements.
 * NOT blind human-expert labels; these disagreements demonstrate failure measurements only.
 */
import {policyImpactFixture} from './policy-impact.mjs';

export function impactExperimentFixture(){
 const changed=policyImpactFixture();
 const same=policyImpactFixture();
 same.after.clauses=same.before.clauses.map(c=>({...c}));
 const ownership=policyImpactFixture();
 ownership.after.clauses=ownership.before.clauses.map(c=>c.id==='CLAUSE-OWNER'?
  {...c,text:'Synthetic alternative: the technical owner must be named and documented in the evaluation record.'}:{...c});
 const retired=policyImpactFixture();
 retired.after.clauses=retired.after.clauses.filter(c=>c.id!=='CLAUSE-REVIEW');
 const cases=[
  {id:'changed-A',systemId:'SIMULATED-DPT-A',referenceAffected:true,policyInput:changed},
  {id:'changed-B',systemId:'SIMULATED-DPT-B',referenceAffected:true,policyInput:changed},
  {id:'unchanged-A',systemId:'SIMULATED-DPT-A',referenceAffected:false,policyInput:same},
  {id:'unchanged-B',systemId:'SIMULATED-DPT-B',referenceAffected:false,policyInput:same},
  {id:'owner-A',systemId:'SIMULATED-DPT-A',referenceAffected:true,policyInput:ownership},
  {id:'owner-B',systemId:'SIMULATED-DPT-B',referenceAffected:false,policyInput:ownership},
  {id:'retired-A',systemId:'SIMULATED-DPT-A',referenceAffected:true,policyInput:retired},
  {id:'retired-B',systemId:'SIMULATED-DPT-B',referenceAffected:false,policyInput:retired}
 ];
 return {datasetId:'synthetic-benchmark-demo-v1',cases};
}
