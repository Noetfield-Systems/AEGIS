/** AEGIS-103 complete lifecycle demonstration: ALL policy clauses and thresholds are synthetic. */
import {integratedFixture} from './integrated.mjs';
export function governedFixture(){
 const scenario=integratedFixture();
 for(const w of scenario.policy.workItems){
  if(w.phase==='IN_PROGRESS')w.policyVersion=scenario.policy.before.version;
  if(w.phase==='PLANNED')w.scheduledFor=w.id==='planned-A'?'2026-11-22':'2026-11-25';
 }
 // Technical reviewer approvals are absent until an independently configured signing key
 // is explicitly trusted. Never ship a test signing key or pre-approved policy mapping.
 return {asOf:'2026-11-18',afterEffectiveOn:'2026-11-15',scenario,approvals:[]};
}
