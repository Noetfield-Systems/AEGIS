/**
 * E5 bounded Ed25519 technical review attestation.
 * A valid signature proves control of a configured private key, not independent
 * legal/professional identity, an external peer review, or federal compliance.
 */
import {verify as cryptoVerify} from 'node:crypto';
import {contentHash} from './replay.mjs';
const SHA=/^sha256:[0-9a-f]{64}$/;
const ID=/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,79}$/;
export function reviewStatement(payload){
 if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new TypeError('Review statement required');
 const {caseReceiptHash,decision,reason,issuedAt,nonce,reviewerKeyId}=payload;
 if(!SHA.test(caseReceiptHash??''))throw new TypeError('Review receipt SHA-256 required');
 if(!['APPROVE','REJECT','REQUEST_CHANGES'].includes(decision))throw new TypeError('Invalid review decision');
 if(typeof reason!=='string'||reason.trim().length<12||reason.length>1200)throw new TypeError('Review reason must be 12–1200 characters');
 if(typeof issuedAt!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(issuedAt)||
    !Number.isFinite(Date.parse(issuedAt)))throw new TypeError('Invalid issuedAt');
 if(typeof nonce!=='string'||!/^[a-f0-9-]{36}$/i.test(nonce))throw new TypeError('Review nonce must be UUID');
 if(typeof reviewerKeyId!=='string'||!ID.test(reviewerKeyId))throw new TypeError('Invalid reviewerKeyId');
 return {audience:'AEGIS_TECHNICAL_REVIEW_ATTESTATION_V1',caseReceiptHash,
  decision,reason:reason.trim(),issuedAt,nonce,reviewerKeyId,
  scope:'TECHNICAL_MEASUREMENT_ONLY',legalApprovalClaimed:false};
}
export function verifySignedReview(payload,{trustedKeys=[],journal,clock=Date.now}={}){
 const message=reviewStatement(payload);
 if(!journal||!Array.isArray(journal.cases)||!Array.isArray(journal.events))throw new TypeError('Review journal required');
 const current=clock(),issued=Date.parse(message.issuedAt);
 if(issued>current+5*60_000||issued<current-24*3600_000)throw new TypeError('Signed review timestamp outside bounded validity window');
 const entry=journal.cases.find(c=>c.receiptHash===message.caseReceiptHash);
 if(!entry)throw new TypeError('Review case does not exist');
 if(journal.events.some(e=>e.reviewerKeyId===message.reviewerKeyId&&e.reviewerNonce===message.nonce))
  throw new TypeError('Duplicate signed reviewer nonce');
 if(!Array.isArray(trustedKeys)||trustedKeys.length>30)throw new TypeError('Invalid trusted reviewers');
 const k=trustedKeys.find(x=>x.id===message.reviewerKeyId);
 if(!k||k.allowAssuranceReviews!==true||typeof k.publicKeyPem!=='string'||
    typeof k.reviewerDisplayName!=='string'||k.reviewerDisplayName.length<2||
    !Array.isArray(k.allowedCaseScenarioIds)||!k.allowedCaseScenarioIds.includes(entry.scenarioId))
  throw new TypeError('Reviewer key not authorized for case scope');
 if(typeof payload.signature!=='string'||! /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(payload.signature)||
    payload.signature.length<80||payload.signature.length>200)throw new TypeError('Invalid reviewer signature encoding');
 let valid=false;
 try{valid=cryptoVerify(null,Buffer.from(JSON.stringify(message)),k.publicKeyPem,Buffer.from(payload.signature,'base64'))}catch{}
 if(!valid)throw new TypeError('Invalid reviewer signature');
 return Object.freeze({
  identityMode:'ED25519_REVIEWER_KEY_VERIFIED',id:message.reviewerKeyId,
  reviewerDisplayName:k.reviewerDisplayName,role:'TECHNICAL_REVIEWER',
  reviewerNonce:message.nonce,signatureEvidenceHash:contentHash({statement:message,signature:payload.signature}),
  independentHumanIdentityAttested:false,legalApprovalClaimed:false
 });
}
