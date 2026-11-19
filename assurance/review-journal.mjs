/** Local single-admin internal review journal.
 * Hash chaining detects edits inside a stored record but cannot provide external attestation.
 * This is NOT an independent or multi-tenant federal reviewer identity system.
 */
import {contentHash} from './replay.mjs';
const bad=s=>{throw new TypeError(s)};
const sha=s=>typeof s==='string'&&/^sha256:[0-9a-f]{64}$/.test(s);
export const emptyReviewJournal=()=>({schema:1,cases:[],events:[]});

export function verifyReviewJournal(journal){
 if(!journal||journal.schema!==1||!Array.isArray(journal.cases)||!Array.isArray(journal.events))bad('invalid review journal');
 if(journal.cases.length>2000||journal.events.length>5000)bad('review journal is out of bounded capacity');
 const seen=new Set(),caseIds=new Set();
 for(const c of journal.cases){
  if(!sha(c.receiptHash)||seen.has(c.receiptHash)||!sha(c.sourceHash)||!sha(c.entryHash))bad('invalid case receipt');
  seen.add(c.receiptHash);caseIds.add(c.receiptHash);
  const {entryHash,...rest}=c;
  if(contentHash(rest)!==entryHash)bad('case metadata hash mismatch');
 }
 let prev=null;
 for(const event of journal.events){
  const {eventHash,...rest}=event;
  if(event.prevHash!==prev||!caseIds.has(event.caseReceiptHash)||contentHash(rest)!==eventHash)bad('review journal chain mismatch');
  prev=eventHash;
 }
 return true;
}
export function appendCase(journal,result,at){
 verifyReviewJournal(journal);
 if(!result||result.kind!=='integrated-ai-assurance-simulation'||!sha(result.receiptHash)||!sha(result.sourceHash))bad('only native integrated result receipts can become review cases');
 if(journal.cases.some(c=>c.receiptHash===result.receiptHash))return {journal,created:false,entry:journal.cases.find(c=>c.receiptHash===result.receiptHash)};
 if(journal.cases.length>=2000)bad('case capacity exhausted; archive with authorized retention policy first');
 if(typeof at!=='string'||Number.isNaN(Date.parse(at)))bad('recorded date is invalid');
 const entry={
  caseId:'CASE-'+String(journal.cases.length+1).padStart(5,'0'),
  createdAt:at,receiptHash:result.receiptHash,sourceHash:result.sourceHash,
  scenarioId:result.scenarioId,
  simulated:true,iscEvidenceCredited:false,
  summary:structuredClone(result.summary),
  status:'PENDING_INTERNAL_OPERATOR_REVIEW'
 };
 const record={...entry,entryHash:contentHash(entry)};
 return {journal:{...journal,cases:[...journal.cases,record]},entry:record,created:true};
}
export function appendReview(journal,payload,actor,at){
 verifyReviewJournal(journal);
 if(!payload||typeof payload!=='object'||Array.isArray(payload))bad('review payload must be an object');
 if(actor!=='local-admin')bad('review actor is not authorized');
 if(!sha(payload.caseReceiptHash)||!journal.cases.some(c=>c.receiptHash===payload.caseReceiptHash))bad('target case receipt not recorded');
 if(!['APPROVE','REJECT','REQUEST_CHANGES'].includes(payload.decision))bad('review decision is unsupported');
 if(typeof payload.reason!=='string'||payload.reason.trim().length<12||payload.reason.length>1200)bad('review reason must be 12–1200 characters');
 if(typeof payload.reviewerDisplayName!=='string'||payload.reviewerDisplayName.trim().length<2||payload.reviewerDisplayName.length>120)bad('reviewer display name required');
 if(journal.events.length>=5000)bad('review journal event capacity exhausted');
 if(typeof at!=='string'||Number.isNaN(Date.parse(at)))bad('review timestamp invalid');
 const prevHash=journal.events.at(-1)?.eventHash??null;
 const event={
  id:'REVIEW-'+String(journal.events.length+1).padStart(6,'0'),
  caseReceiptHash:payload.caseReceiptHash,
  decision:payload.decision,
  reason:payload.reason.trim(),
  reviewerDisplayName:payload.reviewerDisplayName.trim(),
  authenticatedSessionRole:actor,identityIndependentlyVerified:false,
  recordedAt:at,prevHash,
  independentReviewClaimed:false,
  legalApprovalClaimed:false,
  scope:'INTERNAL_OPERATOR_COMMENT_ONLY'
 };
 const record={...event,eventHash:contentHash(event)};
 return {journal:{...journal,events:[...journal.events,record]},event:record};
}
const htmlEscape=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export function renderReviewReport(journal,lang='en'){
 verifyReviewJournal(journal);
 if(!['en','fr'].includes(lang))bad('report locale must be en or fr');
 const fr=lang==='fr';
 const t=(en,french)=>fr?french:en;
 const rows=journal.cases.map(c=>{
  const latest=journal.events.filter(x=>x.caseReceiptHash===c.receiptHash).at(-1);
  return '<tr><td>'+htmlEscape(c.caseId)+'</td><td>'+htmlEscape(c.scenarioId)+'</td><td><code>'+htmlEscape(c.receiptHash)+'</code></td><td>'+htmlEscape(latest?.decision??'PENDING')+'</td><td>'+htmlEscape(latest?.reviewerDisplayName??'—')+'</td><td>'+htmlEscape(latest?.reason??'—')+'</td></tr>';
 }).join('');
 return '<!doctype html><html lang="'+(fr?'fr-CA':'en-CA')+'" dir="ltr"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1"><title>AEGIS | '+t('Internal review report','Rapport de révision interne')+'</title>'+
  '<style>body{font:15px/1.6 system-ui,Arial,sans-serif;max-width:1080px;margin:40px auto;padding:0 22px;color:#142638}h1{font-size:28px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccd7dc;padding:10px;text-align:left;overflow-wrap:anywhere}code{font-size:11px}small{color:#526476}</style></head><body>'+
  '<h1>AEGIS — '+t('Internal assurance review','Révision interne de l’assurance')+'</h1>'+
  '<p>'+t('Synthetic technical simulations only. This document is not independent review, an official government determination or TRL evidence.','Simulations techniques uniquement. Ce document ne constitue ni une révision indépendante, ni une décision officielle du gouvernement, ni une preuve du NMT.')+'</p>'+
  '<table><thead><tr><th>'+t('Case','Dossier')+'</th><th>'+t('Scenario','Scénario')+'</th><th>'+t('Receipt hash','Empreinte du reçu')+'</th><th>'+t('Operator decision','Décision interne')+'</th><th>'+t('Display name','Nom affiché')+'</th><th>'+t('Reason','Motif')+'</th></tr></thead><tbody>'+rows+'</tbody></table>'+
  '<p><small>'+t('Integrity check: each record and event includes a content hash, but no external signature or person-level authentication is asserted.','Contrôle d’intégrité : chaque dossier et événement possède une empreinte, sans signature externe ni authentification individuelle certifiée.')+'</small></p></body></html>';
}
