import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {getSourceRegistry} from '../assurance/source-registry.mjs';
import {getCandidatePolicyMapping,validateCandidatePolicyMapping} from '../assurance/policy-mapping.mjs';
import {contentHash} from '../assurance/replay.mjs';
const load=async p=>JSON.parse(await readFile(new URL('../'+p,import.meta.url),'utf8'));

test('actual official HTML byte digest is anchored to original GitHub Actions artifact and not a text paraphrase',async()=>{
 const manifest=await load('ops/policy-snapshots/DIRECTIVE_ADM_2026-11-19.manifest.json');
 const src=getSourceRegistry();
 assert.equal(manifest.byteLength,69865);
 assert.equal(manifest.originalBytesVerifiedInGitHubActions,true);
 assert.equal(manifest.qualifiedExpertMappingApproval,false);
 assert.equal(src.capturedOriginalDocuments.length,1);
 assert.equal(src.capturedOriginalDocuments[0].originalBytesSha256,manifest.sha256);
 assert.equal(src.officialFullDocumentHashesVerified,false,'one captured source cannot prove entire reference corpus');
 assert.equal(src.approvedRegulatoryMappings,0);
 assert.match(manifest.originalBytesAndManifestArtifact,/actions\/runs\/44521533939\/artifacts\/14526599860/);
});

test('candidate clauses map to real referenced section IDs but never self-approve ISC results',async()=>{
 const candidate=await load('ops/policy-mappings/DADM_candidate_v1.json');
 const manifest=await load('ops/policy-snapshots/DIRECTIVE_ADM_2026-11-19.manifest.json');
 assert.equal(validateCandidatePolicyMapping(candidate,manifest),true);
 const v=getCandidatePolicyMapping();
 const {receiptHash,...unhashed}=v;
 assert.equal(receiptHash,contentHash(unhashed));
 assert.deepEqual(v.clauses.map(x=>x.section),['5.1','6.2.7','6.3.1','6.3.2','6.3.7','6.3.11']);
 assert.equal(v.sourceEffectiveVersionAttested,false);
 assert.equal(v.expertApproval,false);
 assert.equal(v.applicableToCurrentSystem,'UNDETERMINED');
 assert.equal(v.iscEvidenceCredited,false);
 const tampered={...candidate,policyMappingExpertSigned:true};
 assert.throws(()=>validateCandidatePolicyMapping(tampered,manifest),/approval|External/);
 const wrongHash={...candidate,capturedOriginalBytesHash:'sha256:'+'0'.repeat(64)};
 assert.throws(()=>validateCandidatePolicyMapping(wrongHash,manifest),/bound/);
});
