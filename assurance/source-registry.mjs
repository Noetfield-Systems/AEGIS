/**
 * Official-source reference catalogue. The short excerpts were checked against the
 * corresponding published Canada.ca/TBS page on 2026-11-18. This is NOT a complete,
 * archived policy version: no governmental document bytes were captured or signed.
 */
import {contentHash} from './replay.mjs';
export const SOURCE_CAPTURE_DATE='2026-11-18';
export const SOURCE_REFERENCES=Object.freeze([
 {id:'POLICY_SERVICE_DIGITAL',publisher:'Treasury Board of Canada Secretariat',title:'Policy on Service and Digital',url:'https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32603',instrument:'POLICY',citationStatus:'OFFICIAL_URL_CHECKED',publishedVersion:null},
 {id:'DIRECTIVE_ADM',publisher:'Treasury Board of Canada Secretariat',title:'Directive on Automated Decision-Making',url:'https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592',instrument:'DIRECTIVE',citationStatus:'OFFICIAL_SECTION_INDEX_CHECKED',publishedVersion:null},
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
export function getSourceRegistry(){
 return {
  kind:'federal-source-reference-catalogue',checkedOn:SOURCE_CAPTURE_DATE,
  sources:SOURCE_REFERENCES.map(x=>({...x})),
  excerptReferences:CHECKED_CLAUSE_EXCERPTS.map(x=>({...x})),
  officialFullDocumentHashesVerified:false,
  sourceVersionAttested:false,
  approvedRegulatoryMappings:0,
  limitations:['Excerpt digests cover only the quoted strings, never the original government HTML or PDF bytes.','No section is an approved model metric control; source applicability needs a qualified human review.']
 };
}
