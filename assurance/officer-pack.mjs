/** Deterministic, candid officer-facing evidence packet. Synthetic implementation
 * measurements are never upgraded to independently verified federal outcomes.
 */
import {runNative} from './native.mjs';
import {getSourceRegistry} from './source-registry.mjs';
import {contentHash} from './replay.mjs';
import {integratedFixture} from '../fixtures/integrated.mjs';
import {governedFixture} from '../fixtures/governed.mjs';
import {impactExperimentFixture} from '../fixtures/impact-experiment.mjs';

const tests=Object.freeze({
 E1:['test/policy-impact.test.mjs','test/impact-experiment.test.mjs','test/integrated.test.mjs'],
 E2:['test/server.integration.test.mjs'],
 E3:['test/server.integration.test.mjs','test/security-remediation.test.mjs'],
 E4:['test/golden-replay.test.mjs','test/governed-lifecycle.test.mjs'],
 E5:['test/governed-lifecycle.test.mjs','test/workbench.test.mjs','test/server.integration.test.mjs'],
 E6:['test/native.test.mjs','test/advanced-native.test.mjs','test/golden-replay.test.mjs']
});
const cautious=(g)=>({
 id:g.id,requirement:g.requirement,
 internalStatus:g.status,
 fullyVerified:false,
 implementedArtifacts:g.implemented,
 executableTests:tests[g.id]||g.verifiedExperiment,
 missingIndependentEvidence:g.missingEvidence,
 ownerRole:g.ownerRole
});
export function buildOfficerEvidencePack(matrix){
 if(!matrix||matrix.selfAssessedOnly!==true||!Array.isArray(matrix.gates)||matrix.gates.length!==6)
  throw new TypeError('Expected six self-assessed ISC essential outcomes');
 const integrated=runNative({mode:'integrated',input:integratedFixture()});
 const governed=runNative({mode:'governed-lifecycle',input:governedFixture()});
 const benchmark=runNative({mode:'impact-experiment',input:impactExperimentFixture()});
 const sources=getSourceRegistry();
 if(integrated.summary.regulatoryComplianceStatus!=='UNABLE_TO_DETERMINE'
   ||benchmark.referenceLabelsIndependentlyVerified!==false
   ||sources.officialFullDocumentHashesVerified!==false)
  throw new Error('Experimental evidence contract is not conservative');
 const evidence={
  schemaVersion:'3.2-officer-experimental',
  challenge:matrix.challenge,
  reproducibility:'Deterministic same-source inputs; execute scripts/officer-evidence-pack.mjs twice and compare bytes.',
  iscEvidenceCredited:false,
  officialPolicyApplicabilityVerified:false,
  policyExpertMappingApproved:sources.approvedRegulatoryMappings>0,
  independentHumanReviewerVerified:false,
  trl5Established:false,
  externalComparisonMeasured:false,
  sampleData:'SYNTHETIC_ONLY',
  method:'First-party source catalogue → controlled integrated native evaluation → governed lifecycle → source-labelled impact benchmark',
  sourceReferences:{
   checkedOn:sources.checkedOn,
   sourceCount:sources.sources.length,
   referenceUrls:sources.sources.map(x=>({id:x.id,url:x.url,citationStatus:x.citationStatus,fullDocumentVersionVerified:x.publishedVersion!==null})),
   excerptCount:sources.excerptReferences.length,
   fullDocumentsCapturedAndHashed:sources.officialFullDocumentHashesVerified,
   approvedRegulatoryMappings:sources.approvedRegulatoryMappings,
   disclaimer:'Official reference URLs only; excerpts and effective versions have not been independently archived and professionally mapped to the synthetic technical controls.'
  },
  technicalExperiment:{
   kind:integrated.kind,scenarioId:integrated.scenarioId,
   sourceVersions:integrated.sourceVersions,
   summary:integrated.summary,
   affectedSystemIds:integrated.affectedSystemIds,
   unaffectedSystemIds:integrated.unaffectedSystemIds,
   beforeAfterFindings:integrated.findingsTrace,
   reassessmentQueue:integrated.reassessmentQueue,
   nativeReceiptHash:integrated.receiptHash
  },
  lifecycleExperiment:{
   completedNativeReplays:governed.completedNativeReplays,
   lifecyclePlans:governed.lifecyclePlans,
   technicalApprovalChecks:governed.technicalApprovalChecks,
   regulatoryStatus:governed.regulatoryStatus,
   lifecycleReceiptHash:governed.receiptHash
  },
  syntheticBenchmark:{
   referenceLabelsIndependentlyVerified:benchmark.referenceLabelsIndependentlyVerified,
   externalCompetitiveBenchmark:benchmark.externalCompetitiveBenchmark,
   datasetId:benchmark.datasetId,
   metrics:benchmark.metrics,
   exactSourceVersions:benchmark.predictions.map(x=>({caseId:x.id,policyBefore:x.policyBefore,policyAfter:x.policyAfter,sourceInputHash:x.sourceInputHash,policyImpactReceipt:x.policyImpactReceipt})),
   experimentReceiptHash:benchmark.receiptHash,
   limitations:benchmark.limitations
  },
  humanReview:{
   demonstratedMode:'Single local operator journal, not independent reviewer sign-off',
   authenticatedNamedIndependentReviewer:false,
   apiEndpoints:['POST /api/assurance/cases','POST /api/assurance/reviews','POST /api/assurance/report-detail'],
   evidenceFiles:['assurance/review-journal.mjs','test/server.integration.test.mjs'],
   reviewState:'PENDING_EXTERNAL_VALIDATION'
  },
  executionOrder:[
   {step:1,title:'Reference official policy URLs',status:'URL_REFERENCES_ONLY',artifact:'assurance/source-registry.mjs'},
   {step:2,title:'Expert-approved clause-to-control mapping',status:'NOT_ESTABLISHED',artifact:null},
   {step:3,title:'Bounded synthetic AI inventory',status:'REPRODUCED',artifact:'fixtures/integrated.mjs'},
   {step:4,title:'First-party data / model / output measures',status:'REPRODUCED_SYNTHETIC',artifact:'assurance/native.mjs'},
   {step:5,title:'Policy change impact detection',status:'REPRODUCED_SYNTHETIC',artifact:'assurance/policy.mjs'},
   {step:6,title:'Historical replay and in-flight/new lifecycle plan',status:'REPRODUCED_SYNTHETIC',artifact:'assurance/governed-lifecycle.mjs'},
   {step:7,title:'Authenticated internal operator review',status:'INTERNAL_SINGLE_ADMIN_ONLY',artifact:'assurance/review-journal.mjs'},
   {step:8,title:'Before/after native findings',status:'REPRODUCED_SYNTHETIC',artifact:'assurance/integrated.mjs'},
   {step:9,title:'Independent evidence validation',status:'NOT_ESTABLISHED',artifact:null},
   {step:10,title:'Source/measurement report and honest limitations',status:'REPRODUCIBLE_TECHNICAL_ONLY',artifact:'assurance/integrated-report.mjs'}
  ],
  essentialOutcomes:matrix.gates.map(cautious),
  essentialOutcomesFullyVerified:0,
  limitations:[
   'No policy expert has independently signed exact source version or applicability mappings.',
   'Reference-label ground truth is synthetic and selected, not independent or representative.',
   'Single-admin review history does not prove distinct reviewer identity or lawful approval.',
   'No independent TRL5 study, federal endorsement, verified data residency, or comparative superiority is asserted.',
   'This does not edit or credit the private ISC evidence score.'
  ]
 };
 return {...evidence,receiptHash:contentHash(evidence)};
}
