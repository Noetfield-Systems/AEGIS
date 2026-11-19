/**
 * Official-source reference catalogue. The short excerpts were checked against the
 * corresponding published Canada.ca/TBS page in November 2026. The original
 * Directive HTML bytes were captured and SHA-256-verified in CI on 2026-11-19.
 * This is NOT a human-attested effective policy version or legal interpretation.
 */
import {contentHash} from './replay.mjs';
export const SOURCE_CAPTURE_DATE='2026-11-19';
export const SOURCE_REFERENCES=Object.freeze([
 {id:'POLICY_SERVICE_DIGITAL',publisher:'Treasury Board of Canada Secretariat',title:'Policy on Service and Digital',url:'https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32603',instrument:'POLICY',citationStatus:'OFFICIAL_URL_CHECKED',publishedVersion:null},
 {id:'DIRECTIVE_ADM',publisher:'Treasury Board of Canada Secretariat',title:'Directive on Automated Decision-Making',url:'https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592',instrument:'DIRECTIVE',citationStatus:'ORIGINAL_HTML_BYTES_CAPTURED_CI_VERIFIED',publishedVersion:null},
 {id:'AIA',publisher:'Treasury Board of Canada Secretariat',title:'Algorithmic Impact Assessment',url:'https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/algorithmic-impact-assessment.html',instrument:'GOVERNMENT_GUIDANCE',citationStatus:'OFFICIAL_SECTION_TEXT_CHECKED',publishedVersion:null},
 {id:'AI_STRATEGY',publisher:'Government of Canada',title:'AI Strategy for the Federal Public Service 2025–2027',url:'https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/gc-ai-strategy-overview.html',instrument:'STRATEGY',citationStatus:'OFFICIAL_URL_REFERENCE_ONLY',publishedVersion:null},
 {id:'AI_ETHICS',publisher:'Government of Canada',title:'AI ethics and responsibilities',url:'https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/ai-ethics-responsibilities.html',instrument:'GUIDANCE',citationStatus:'OFFICIAL_URL_REFERENCE_ONLY',publishedVersion:null},
 {id:'DADM_SCOPE_GUIDE',publisher:'Treasury Board of Canada Secretariat',title:'Guide on the Scope of the Directive on Automated Decision-Making',url:'https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/guide-scope-directive-automated-decision-making.html',instrument:'SCOPE_GUIDANCE',citationStatus:'OFFICIAL_SECTION_TEXT_CHECKED',publishedVersion:null,pageDetailsDate:'2026-09-15'}
]);
export const CHECKED_CLAUSE_EXCERPTS=Object.freeze([
 {sourceId:'DIRECTIVE_ADM',section:'5.1',clauseId:'DADM-5.1',excerpt:'This directive applies to any automated decision system in production',scope:'administrative decision or related assessment',reviewStatus:'SOURCE_EXCERPT_CHECKED_NOT_MAPPED'},
 {sourceId:'AIA',section:'3.1',clauseId:'AIA-3.1-REVIEW',excerpt:'The AIA should be reviewed, approved and updated on a scheduled basis',scope:'in-scope automated decision system',reviewStatus:'SOURCE_EXCERPT_CHECKED_NOT_MAPPED'},
 {sourceId:'DADM_SCOPE_GUIDE',section:'Introduction',clauseId:'SCOPE-INTRO',excerpt:'Not all AI used in the federal public service falls under this directive',scope:'federal administrative decision contexts',reviewStatus:'SOURCE_EXCERPT_CHECKED_NOT_MAPPED'}
].map(x=>({...x,excerptSha256:contentHash(x.excerpt)})));
export const ORIGINAL_SOURCE_CAPTURES=Object.freeze([{
 sourceId:'DIRECTIVE_ADM',retrievedAt:'2026-11-19T12:11:17.510Z',
 contentType:'text/html',byteLength:69865,
 originalBytesSha256:'sha256:225f990673205a49cee216fb8fc124909e8eb917559e3e258a8dd7fb7c35a0e3',
 evidenceManifest:'ops/policy-snapshots/DIRECTIVE_ADM_2026-11-19.manifest.json',
 originalArtifact:'https://github.com/Noetfield-Systems/AEGIS/actions/runs/44521533939/artifacts/14526599860',
 capturedOriginalBytesVerifiedByCI:true,sourceEffectiveVersionApproved:false,
 professionalMappingApproved:false,independentReviewerSigned:false,
 governmentComplianceConfirmed:false
}]);
export function getSourceRegistry(){
 return {
  kind:'federal-source-reference-catalogue',checkedOn:SOURCE_CAPTURE_DATE,
  sources:SOURCE_REFERENCES.map(x=>({...x})),
  excerptReferences:CHECKED_CLAUSE_EXCERPTS.map(x=>({...x})),
  capturedOriginalDocuments:ORIGINAL_SOURCE_CAPTURES.map(x=>({...x})),
  officialFullDocumentHashesVerified:false,
  sourceVersionAttested:false,
  approvedRegulatoryMappings:0,
  limitations:['The Directive original HTML bytes were captured and hashed by GitHub CI, but its legal effective version and applicability were not independently attested.','Other source excerpts are only hashes of excerpt strings, not original documents.','No section-to-technical-control mapping has been approved by a qualified external policy reviewer.']
 };
}
