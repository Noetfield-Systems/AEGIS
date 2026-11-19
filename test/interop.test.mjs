import test from 'node:test';
import assert from 'node:assert/strict';
import {adapterKinds,normalizeGovernanceRecord,validateAdapterBatch} from '../assurance/interop.mjs';
import {interoperabilitySamples} from '../fixtures/interop.mjs';
import {contentHash} from '../assurance/replay.mjs';

test('three independently shaped reference adapter schemas normalize deterministically',()=>{
 assert.deepEqual(adapterKinds,['governance-inventory-v1','aia-assessment-v1','otel-agent-span-v1']);
 const a=validateAdapterBatch({records:interoperabilitySamples});
 const b=validateAdapterBatch({records:interoperabilitySamples});
 assert.deepEqual(a,b);
 assert.equal(a.recordCount,3);
 assert.equal(a.readOnly,true);
 assert.equal(a.externalIntegrationExecuted,false);
 assert.equal(a.independentConnectionVerified,false);
 assert.equal(a.iscEvidenceCredited,false);
 assert.equal(a.receiptHash,contentHash(a.records));
 for(const rec of a.records){
  assert.equal(rec.legalApplicability,'UNDETERMINED');
  assert.equal(rec.sourceAuthorityConfirmed,false);
  assert.equal(rec.experimental,true);
  assert.match(rec.referenceHash,/^sha256:[0-9a-f]{64}$/);
 }
 assert.equal(a.records[0].system.aiRole,'DECISION_SUPPORT');
 assert.equal(a.records[1].assessment.impactLevel,2);
 assert.equal(a.records[2].trace.durationMs,150);
 assert.equal(a.records[2].trace.approvedMetadata['gen_ai.operation.name'],'evaluate');
 assert.doesNotMatch(JSON.stringify(a),/PRIVATE CONTENT MUST NOT APPEAR|prompt/,'raw AI prompts are never included in outputs');
});

test('bounded adapter validation rejects malformed or forged external data',()=>{
 assert.throws(()=>validateAdapterBatch({records:[]}),/1–20/);
 assert.throws(()=>validateAdapterBatch({records:[] .concat(Array(21).fill(interoperabilitySamples[0]))}),/1–20/);
 assert.throws(()=>normalizeGovernanceRecord({adapter:'unknown',input:{}}),/Unknown adapter/);
 assert.throws(()=>normalizeGovernanceRecord({...interoperabilitySamples[0],input:{...interoperabilitySamples[0].input,aiRole:'APPROVED_BY_GOVERNMENT'}}),/Unsupported AI role/);
 assert.throws(()=>normalizeGovernanceRecord({...interoperabilitySamples[1],input:{...interoperabilitySamples[1].input,impactLevel:999}}),/impactLevel/);
 assert.throws(()=>normalizeGovernanceRecord({...interoperabilitySamples[2],input:{...interoperabilitySamples[2].input,traceId:'invalid'}}),/identifier/);
 assert.throws(()=>normalizeGovernanceRecord({...interoperabilitySamples[2],input:{...interoperabilitySamples[2].input,endTimeUnixNano:'1699999999999999999'}}),/interval/);
});
