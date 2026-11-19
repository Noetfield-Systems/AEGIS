/** Candidate source-to-technical-control mapping from an actual DADM HTML byte capture.
 * This is NOT a legal opinion, applicable-policy determination or SME approval.
 */
import {readFileSync} from 'node:fs';
import {contentHash} from './replay.mjs';
const snapshot=JSON.parse(readFileSync(new URL('../ops/policy-snapshots/DIRECTIVE_ADM_2026-11-19.manifest.json',import.meta.url),'utf8'));
const candidate=JSON.parse(readFileSync(new URL('../ops/policy-mappings/DADM_candidate_v1.json',import.meta.url),'utf8'));
export function validateCandidatePolicyMapping(mapping=candidate,manifest=snapshot){
 if(mapping?.schemaVersion!=='1.0'||mapping.sourceId!=='DIRECTIVE_ADM'||
    manifest.sourceId!=='DIRECTIVE_ADM'||mapping.capturedOriginalBytesHash!==manifest.sha256)
  throw new TypeError('Policy mapping is not bound to the verified original source bytes');
 if(manifest.originalBytesVerifiedInGitHubActions!==true||manifest.qualifiedExpertMappingApproval!==false)
  throw new TypeError('Policy capture trust boundary invalid');
 if(mapping.policyMappingExpertSigned!==false||mapping.legalApplicability!=='UNDETERMINED'||
    mapping.mappingStatus!=='CANDIDATE_ENGINEERING_ONLY'||mapping.evidenceCreditedToISC!==false||
    mapping.reviewerName!==null||mapping.signedMappingDigest!==null)
  throw new TypeError('External approval cannot be inferred from proposed mapping');
 if(!Array.isArray(mapping.mappings)||mapping.mappings.length!==6)
  throw new TypeError('Expected exactly six explicit candidate clauses');
 const seen=new Set();
 for(const item of mapping.mappings){
  if(!/^\d+(?:\.\d+)+$/.test(item.section)||item.id!=='DADM-'+item.section||
     item.expertReview!=='NOT_COMPLETED'||!item.candidateControlId||
     typeof item.testPath!=='string'||!item.testPath.startsWith('test/')||
     seen.has(item.id))throw new TypeError('Invalid, duplicate or falsely reviewed policy clause mapping');
  seen.add(item.id);
 }
 return true;
}
export function getCandidatePolicyMapping(){
 validateCandidatePolicyMapping();
 const entries=candidate.mappings.map(x=>({...x}));
 const report={
  kind:'aegis-proposed-dadm-clause-control-mapping',
  originalByteSha256:snapshot.sha256,
  sourceCaptureCI:snapshot.verificationWorkflowRun,
  sourceCapturedAt:snapshot.retrievedAt,
  sourceEffectiveVersionAttested:false,
  applicableToCurrentSystem:'UNDETERMINED',
  expertApproval:false,
  independentlyReviewed:false,
  iscEvidenceCredited:false,
  clauseCount:entries.length,
  clauses:entries,
  unverifiedLimitations:[
   'Official section identifiers were read from a captured policy page; their mapping to AEGIS native tests remains a technical proposal.',
   'Only a qualified human policy expert can assess the effective version, departmental applicability and adequacy of these controls.'
  ]
 };
 return {...report,receiptHash:contentHash(report)};
}
