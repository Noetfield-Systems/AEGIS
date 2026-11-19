/**
 * AEGIS AIA scope triage — reproducible engineering aid, never a legal or departmental determination.
 * References: Government of Canada Guide on the Scope of the Directive on Automated
 * Decision-Making and AIA lifecycle guidance. No user-supplied claim is externally verified.
 */
import {contentHash} from './replay.mjs';
export const OFFICIAL_SCOPE_SOURCES=Object.freeze({
 directive:'https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592',
 scope:'https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/guide-scope-directive-automated-decision-making.html',
 aia:'https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/algorithmic-impact-assessment.html'
});
const fail=x=>{throw new TypeError(x)};
const ENUM=(x,n,values)=>{if(!values.includes(x))fail(n+' must be one of '+values.join(','))};
const id=(x,n)=>{if(typeof x!=='string'||!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(x))fail(n+' invalid');return x};
export function triageAiaScope(input){
 if(!input||typeof input!=='object'||Array.isArray(input))fail('AIA context must be an object');
 id(input.systemId,'systemId');
 ENUM(input.jurisdiction,'jurisdiction',['FEDERAL_CANADA','NON_FEDERAL','UNKNOWN']);
 ENUM(input.stage,'stage',['EXPERIMENTAL_RESEARCH','PRE_PRODUCTION','PRODUCTION','UNKNOWN']);
 ENUM(input.decisionImpact,'decisionImpact',['ADMINISTRATIVE_RIGHTS_OR_INTERESTS','NON_ADMINISTRATIVE','UNKNOWN']);
 ENUM(input.aiDecisionRole,'aiDecisionRole',['MAKES','SUPPORTS','NONE','UNKNOWN']);
 const changes=input.changedAspects===undefined?[]:input.changedAspects;
 if(!Array.isArray(changes)||changes.length>10||changes.some(x=>!['FUNCTIONALITY','SCOPE','MODEL','DATA','AUTOMATION_LEVEL','DECISION_CONTEXT'].includes(x)))fail('changedAspects invalid');
 if(new Set(changes).size!==changes.length)fail('duplicate changes');
 const last=input.lastAiaReviewAt??null;
 if(last!==null&&(typeof last!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(last)||Number.isNaN(Date.parse(last))))fail('lastAiaReviewAt must be an ISO date');
 const signals=[];
 if(input.jurisdiction==='UNKNOWN'||input.stage==='UNKNOWN'||input.decisionImpact==='UNKNOWN'||input.aiDecisionRole==='UNKNOWN'){
  signals.push('Incomplete jurisdiction, lifecycle or decision-role context; cannot establish applicability.');
 }
 if(input.stage==='EXPERIMENTAL_RESEARCH')signals.push('Experimental research not intended for production is generally outside the Directive scope guidance.');
 if(input.decisionImpact==='NON_ADMINISTRATIVE')signals.push('The Directive focuses on administrative decisions affecting rights, privileges or interests.');
 if(input.aiDecisionRole==='SUPPORTS')signals.push('Supporting human administrative judgment can still be within scope.');
 if(changes.length)signals.push('Reported change requires contextual review; AIA guidance specifically mentions functionality and scope updates.');
 let triage='UNABLE_TO_DETERMINE';
 const complete=!['UNKNOWN'].some(v=>[input.jurisdiction,input.stage,input.decisionImpact,input.aiDecisionRole].includes(v));
 if(complete){
  if(input.jurisdiction==='NON_FEDERAL'||input.stage==='EXPERIMENTAL_RESEARCH'||input.decisionImpact==='NON_ADMINISTRATIVE'||input.aiDecisionRole==='NONE'){
   triage='LIKELY_OUT_OF_SCOPE_REQUIRES_DEPARTMENTAL_CONFIRMATION';
  }else if(input.jurisdiction==='FEDERAL_CANADA'&&
       ['PRE_PRODUCTION','PRODUCTION'].includes(input.stage)&&
       input.decisionImpact==='ADMINISTRATIVE_RIGHTS_OR_INTERESTS'&&
       ['MAKES','SUPPORTS'].includes(input.aiDecisionRole)){
   triage='POTENTIALLY_IN_SCOPE_REQUIRES_REVIEW';
  }
 }
 const inScope=triage==='POTENTIALLY_IN_SCOPE_REQUIRES_REVIEW';
 const newAiaReview=inScope&&(last===null||changes.some(x=>['FUNCTIONALITY','SCOPE','MODEL','DATA','AUTOMATION_LEVEL','DECISION_CONTEXT'].includes(x)));
 const out={
  kind:'provisional-aia-scope-triage',methodVersion:'aia-scope-v0.1.0',
  systemId:input.systemId,sourceRefs:OFFICIAL_SCOPE_SOURCES,
  inferredTriage:triage,legalApplicabilityConfirmed:false,
  aiaReviewFlag:newAiaReview?'SCHEDULE_AUTHORIZED_AIA_REVIEW':inScope?'CHECK_EXISTING_AIA_REVIEW_CADENCE':'NOT_AUTO_SCHEDULED',
  latestReviewDate:last,changeAspects:[...changes].sort(),observations:signals,
  finding:'UNABLE_TO_DETERMINE',decisionOwner:'AUTHORIZED_DEPARTMENTAL_REVIEWER_REQUIRED',
  syntheticOrCallerAsserted:true,
  sourceInputHash:contentHash(input),
  limitations:[
   'This is a factual-context triage and is not a legal scope decision or a substitute for departmental legal services.',
   'Inputs, applicability, materiality and effective AIA obligations are unverified caller assertions.',
   'AIA questionnaire results and directive-specific requirements are not calculated by this helper.'
  ]
 };
 return {...out,receiptHash:contentHash(out)};
}
