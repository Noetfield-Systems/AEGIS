/**
 * AEGIS E2 — narrow, deterministic and privacy-minimizing interoperability contracts.
 *
 * These are testable reference adapters for common governance/telemetry shapes,
 * NOT claims of a certified connector to a live federal or commercial service.
 * Validation never writes a private customer record or awards ISC evidence.
 */
import {contentHash} from './replay.mjs';
const KINDS=['governance-inventory-v1','aia-assessment-v1','otel-agent-span-v1'];
export const adapterKinds=Object.freeze([...KINDS]);
const field=(value,name,max=160)=>{
 if(typeof value!=='string'||!value.trim()||value.length>max||/[\u0000-\u001f]/u.test(value))
  throw new TypeError('Invalid '+name);
 return value.trim();
};
const opt=(v,name,max=160)=>v==null?null:field(v,name,max);
const iso=(v,name)=>{
 const text=field(v,name,64);
 if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(text)||!Number.isFinite(Date.parse(text)))
  throw new TypeError('Invalid ISO time '+name);
 return text;
};
const bounded=(input)=>{
 if(!input||typeof input!=='object'||Array.isArray(input)||JSON.stringify(input).length>24_000)throw new TypeError('Invalid bounded adapter document');
 return input;
};
const base=(kind,input,systemId,sourceId)=>{
 const envelope={
  schemaVersion:'1.0',sourceAdapter:kind,externalRecordId:sourceId,
  associatedSystemId:systemId,referenceHash:contentHash({adapter:kind,input}),
  verificationState:'FORMAT_VALIDATED_NOT_EXTERNAL_SOURCE_ATTESTED',
  legalApplicability:'UNDETERMINED',
  sourceAuthorityConfirmed:false,tenantAuthorizationVerified:false,
  experimental:true,iscEvidenceCredited:false
 };
 return envelope;
};
export function normalizeGovernanceRecord({adapter,input}={}){
 if(!KINDS.includes(adapter))throw new TypeError('Unknown adapter; supported: '+KINDS.join(', '));
 const value=bounded(input);
 if(adapter==='governance-inventory-v1'){
  const externalId=field(value.recordId,'recordId',120),systemId=field(value.systemId,'systemId',120),
   title=field(value.name,'name',180),kind=field(value.aiRole,'aiRole',40);
  if(!['DECISION_SUPPORT','AUTOMATED_DECISION','ANALYTICS','AGENT'].includes(kind))throw new TypeError('Unsupported AI role');
  const lifecycle=field(value.lifecycle,'lifecycle',35);
  if(!['PROPOSED','DEVELOPMENT','PILOT','ACTIVE','RETIRED'].includes(lifecycle))throw new TypeError('Invalid lifecycle');
  return {...base(adapter,value,systemId,externalId),
   recordKind:'AI_SYSTEM_INVENTORY',system:{id:systemId,name:title,aiRole:kind,lifecycle,
    ownerReference:opt(value.ownerReference,'ownerReference'),decisionImpact:'NOT_EVALUATED'},
   dataMinimized:true,sourceSchemaClaimed:'AEGIS_GOVERNANCE_INVENTORY_EXCHANGE_1'};
 }
 if(adapter==='aia-assessment-v1'){
  const assessmentId=field(value.assessmentId,'assessmentId',120),systemId=field(value.systemId,'systemId',120);
  if(!Number.isInteger(value.impactLevel)||value.impactLevel<1||value.impactLevel>4)throw new TypeError('AIA impactLevel must be 1–4');
  const resultStatus=field(value.status,'status',32);
  if(!['DRAFT','IN_REVIEW','PUBLISHED','SUPERSEDED'].includes(resultStatus))throw new TypeError('Invalid AIA status');
  return {...base(adapter,value,systemId,assessmentId),recordKind:'AIA_ASSESSMENT_REFERENCE',
   assessment:{id:assessmentId,impactLevel:value.impactLevel,status:resultStatus,
    publishedAt:value.publishedAt?iso(value.publishedAt,'publishedAt'):null,
    sourceUrl:opt(value.sourceUrl,'sourceUrl',400)},
   disclaimer:'AIA metadata is an imported reference, not AEGIS certification or an official published result.'};
 }
 // OpenTelemetry-inspired minimal span envelope: only pre-approved metadata,
 // NEVER trace prompt, completion, exception message, body or tool arguments.
 const traceId=field(value.traceId,'traceId',32).toLowerCase(),spanId=field(value.spanId,'spanId',16).toLowerCase();
 if(!/^[0-9a-f]{32}$/.test(traceId)||! /^[0-9a-f]{16}$/.test(spanId))throw new TypeError('Invalid OTEL trace/span identifier');
 const start=BigInt(field(value.startTimeUnixNano,'startTimeUnixNano',22));
 const end=BigInt(field(value.endTimeUnixNano,'endTimeUnixNano',22));
 if(start<=0n||end<start||end-start>3600n*1000000000n)throw new TypeError('Invalid OTEL span interval');
 const systemId=field(value.serviceName,'serviceName',120);
 const attrs=value.attributes??[];
 if(!Array.isArray(attrs)||attrs.length>30)throw new TypeError('OTEL attributes must be a bounded array');
 const allowed=new Set(['gen_ai.operation.name','gen_ai.request.model','agent.id']);
 const metadata={};
 for(const item of attrs){
  if(!item||typeof item!=='object'||typeof item.key!=='string')throw new TypeError('Invalid OTEL attribute');
  if(allowed.has(item.key))metadata[item.key]=field(item.value?.stringValue,'OTEL '+item.key,120);
 }
 return {...base(adapter,value,systemId,traceId+':'+spanId),
  recordKind:'AGENT_TRACE_SUMMARY',trace:{
   traceId,spanId,serviceName:systemId,spanName:field(value.name,'name',120),
   durationMs:Number((end-start)/1000000n),approvedMetadata:metadata,
   promptsAndOutputsDiscarded:true
  },sourceSchemaClaimed:'OTEL_MINIMUM_ATTRIBUTE_SUBSET_V1'};
}
export function validateAdapterBatch(payload){
 if(!payload||!Array.isArray(payload.records)||payload.records.length<1||payload.records.length>20)
  throw new TypeError('Expected 1–20 adapter records');
 const normalized=payload.records.map(normalizeGovernanceRecord);
 return {schemaVersion:'1.0',recordCount:normalized.length,sourceFormats:[...new Set(normalized.map(x=>x.sourceAdapter))],
  records:normalized,readOnly:true,externalIntegrationExecuted:false,
  independentConnectionVerified:false,iscEvidenceCredited:false,
  receiptHash:contentHash(normalized)};
}
