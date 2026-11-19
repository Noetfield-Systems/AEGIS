/**
 * AEGIS-103 provisional federal-policy source registry and scoped impact compiler.
 *
 * A source URL is NOT a captured policy snapshot. Supplied version identifiers and hashes
 * are assertions by the caller, not federal validation or evidence of legal applicability.
 * This module is deterministic and never writes to the ISC readiness store.
 */
import {contentHash} from './replay.mjs';

export const FEDERAL_SOURCES=Object.freeze([
 {id:'POLICY_SERVICE_DIGITAL',title:'Policy on Service and Digital',url:'https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32603',kind:'POLICY',sourceStatus:'URL_REFERENCE_ONLY'},
 {id:'DIRECTIVE_ADM',title:'Directive on Automated Decision-Making',url:'https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592',kind:'DIRECTIVE',sourceStatus:'URL_REFERENCE_ONLY'},
 {id:'AIA',title:'Algorithmic Impact Assessment',url:'https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/algorithmic-impact-assessment.html',kind:'ASSESSMENT_GUIDANCE',sourceStatus:'URL_REFERENCE_ONLY'},
 {id:'AI_STRATEGY',title:'AI Strategy for the Federal Public Service 2025–2027',url:'https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/gc-ai-strategy-overview.html',kind:'STRATEGY',sourceStatus:'URL_REFERENCE_ONLY'},
 {id:'AI_ETHICS',title:'AI ethics and responsibilities',url:'https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/ai-ethics-responsibilities.html',kind:'GUIDANCE',sourceStatus:'URL_REFERENCE_ONLY'}
]);
const fail=m=>{throw new TypeError(m)};
const obj=(x,n)=>{if(!x||typeof x!=='object'||Array.isArray(x))fail(n+' must be an object');return x};
const list=(x,n,max)=>{if(!Array.isArray(x)||x.length>max)fail(n+' must be an array with at most '+max+' entries');return x};
const identifier=(x,n)=>{if(typeof x!=='string'||!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(x))fail(n+' must be a bounded identifier');return x};
const noDup=(values,n)=>{if(new Set(values).size!==values.length)fail(n+' contains duplicate IDs')};
const snapshot=x=>{
 obj(x,'snapshot');identifier(x.version,'snapshot.version');
 if(!/^sha256:[0-9a-f]{64}$/.test(x.sourceDigest||''))fail('snapshot.sourceDigest requires sha256 digest of captured source bytes');
 const clauses=list(x.clauses,'snapshot.clauses',100).map(cl=>{
  obj(cl,'clause');identifier(cl.id,'clause.id');
  if(typeof cl.section!=='string'||!cl.section.trim()||cl.section.length>120)fail('clause.section required');
  if(typeof cl.text!=='string'||!cl.text.trim()||cl.text.length>4000)fail('clause.text required');
  return cl;
 });
 noDup(clauses.map(c=>c.id),'snapshot.clauses');
 return new Map(clauses.map(c=>[c.id,c]));
};
const METHODS=new Set(['data','classifier','output']);
const METRICS={data:new Set(['duplicateRate','missingRate','typeErrorRate']),classifier:new Set(['accuracy','precision','recall','f1']),output:new Set(['passRate'])};
function mapping(m, clauseIds) {
 obj(m,'control mapping');
 identifier(m.id,'mapping.id');identifier(m.clauseId,'mapping.clauseId');
 if(!clauseIds.has(m.clauseId))fail('mapping references a clause absent from both versions');
 if(!METHODS.has(m.kind)||!METRICS[m.kind].has(m.metric))fail('mapping references unsupported first-party native metric');
 if(m.kind==='data'&&m.metric!=='duplicateRate')identifier(m.field,'mapping.field');
 if(!['>=','<='].includes(m.operator))fail('mapping.operator must be >= or <=');
 if(typeof m.threshold!=='number'||!Number.isFinite(m.threshold)||m.threshold<0||m.threshold>1)fail('mapping.threshold must be a finite value in [0,1]');
 if(m.mappingStatus!=='PROPOSED')fail('policy mappings must start as PROPOSED; no automated approval');
 return m;
}
export function compilePolicyImpact(input){
 obj(input,'policy impact request');
 const source=FEDERAL_SOURCES.find(s=>s.id===input.sourceId);
 if(!source)fail('unknown federal source; cannot infer policy applicability');
 const oldClauses=snapshot(input.before),newClauses=snapshot(input.after);
 if(input.before.version===input.after.version)fail('new policy snapshot must have a different version ID');
 const beforeIds=new Set(oldClauses.keys()),afterIds=new Set(newClauses.keys()),clauseIds=new Set([...beforeIds,...afterIds]);
 const changes=[...clauseIds].sort().filter(id=>contentHash(oldClauses.get(id)??null)!==contentHash(newClauses.get(id)??null)).map(id=>({
  clauseId:id,changeType:!beforeIds.has(id)?'ADDED':!afterIds.has(id)?'RETIRED':'MODIFIED',
  beforeSection:oldClauses.get(id)?.section??null,afterSection:newClauses.get(id)?.section??null,
  beforeClauseHash:oldClauses.has(id)?contentHash(oldClauses.get(id)):null,
  afterClauseHash:newClauses.has(id)?contentHash(newClauses.get(id)):null
 }));
 const mappingRows=list(input.mappings,'mappings',120).map(m=>mapping(m,clauseIds));
 noDup(mappingRows.map(m=>m.id),'mappings');
 const mappingById=new Map(mappingRows.map(m=>[m.id,m]));
 const systems=list(input.systems,'systems',60).map(s=>{
  obj(s,'system');identifier(s.id,'system.id');
  const assigned=list(s.controlIds,'system.controlIds',120).map(c=>identifier(c,'system.controlId'));
  noDup(assigned,'system.controlIds');
  for(const id of assigned)if(!mappingById.has(id))fail('system references unknown control mapping');
  return {id:s.id,controlIds:assigned};
 });
 noDup(systems.map(s=>s.id),'systems');
 const systemsById=new Map(systems.map(s=>[s.id,s]));
 const workItems=list(input.workItems,'workItems',250).map(w=>{
  obj(w,'workItem');identifier(w.id,'workItem.id');identifier(w.systemId,'workItem.systemId');
  if(!systemsById.has(w.systemId))fail('workItem references unknown system');
  if(!['COMPLETED','IN_PROGRESS','PLANNED'].includes(w.phase))fail('workItem.phase must be COMPLETED, IN_PROGRESS or PLANNED');
  return {id:w.id,systemId:w.systemId,phase:w.phase};
 });
 noDup(workItems.map(w=>w.id),'workItems');
 const changed=new Set(changes.map(c=>c.clauseId));
 const affectedMappings=mappingRows.filter(m=>changed.has(m.clauseId)).sort((a,b)=>a.id.localeCompare(b.id));
 const affectedControlIds=new Set(affectedMappings.map(m=>m.id));
 const impactedSystems=systems.filter(s=>s.controlIds.some(id=>affectedControlIds.has(id))).map(s=>({
  systemId:s.id,controlIds:s.controlIds.filter(id=>affectedControlIds.has(id)).sort(),
  provisionalFinding:'UNABLE_TO_DETERMINE',reason:'Policy mapping must be reviewed and historical native evaluation rerun'
 })).sort((a,b)=>a.systemId.localeCompare(b.systemId));
 const affectedSystemIds=new Set(impactedSystems.map(x=>x.systemId));
 const workQueue=workItems.filter(w=>affectedSystemIds.has(w.systemId)).map(w=>({
  workItemId:w.id,systemId:w.systemId,phase:w.phase,
  action:w.phase==='COMPLETED'?'SCHEDULE_HISTORICAL_NATIVE_REPLAY':w.phase==='IN_PROGRESS'?'REBASE_AND_REASSESS_BEFORE_APPROVAL':'UPDATE_REQUIREMENTS_BEFORE_START',
  reviewRequired:true
 })).sort((a,b)=>a.workItemId.localeCompare(b.workItemId));
 const proposals=affectedMappings.map(m=>({
  controlId:m.id,clauseId:m.clauseId,sourceId:source.id,sourceUrl:source.url,
  fromVersion:input.before.version,toVersion:input.after.version,
  currentSection:newClauses.get(m.clauseId)?.section??null,
  mappingHash:contentHash(m),nativeEvaluator:m.kind,metric:m.metric,
  reviewerStatus:'PENDING_POLICY_AND_TECHNICAL_REVIEW',
  complianceFinding:'UNABLE_TO_DETERMINE',isActive:false
 }));
 const result={
  kind:'federal-source-impact-proposal',methodVersion:'federal-impact-v0.1.0',experimental:true,
  iscEvidenceCredited:false,source:{...source},sourceSnapshotsExternallyVerified:false,
  sourceVersionBefore:input.before.version,sourceVersionAfter:input.after.version,
  sourceDigestBefore:input.before.sourceDigest,sourceDigestAfter:input.after.sourceDigest,
  changedClauses:changes,proposedControls:proposals,impactedSystems,
  unaffectedSystemIds:systems.filter(s=>!affectedSystemIds.has(s.id)).map(s=>s.id).sort(),
  reassessmentQueue:workQueue,decision:'PENDING_HUMAN_REVIEW',
  sourceInputHash:contentHash(input),
  limitations:[
    'The source registry contains official URLs only, not independently archived policy versions or approved obligations.',
    'Source snapshots and clause mappings are supplied by the caller and must be authenticated and approved.',
    'The output is impact planning, not an actual native historical replay, legal advice or compliance certification.',
    'Controls are never activated, previous findings are never changed, and ISC evidence is never credited.'
  ]
 };
 return {...result,receiptHash:contentHash(result)};
}
