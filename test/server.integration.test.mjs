import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {randomBytes} from 'node:crypto';
import {createGoldenFixture} from '../fixtures/golden.mjs';
import {policyImpactFixture} from '../fixtures/policy-impact.mjs';
import {integratedFixture} from '../fixtures/integrated.mjs';
import {governedFixture} from '../fixtures/governed.mjs';

async function freePort(){
 return await new Promise((resolve,reject)=>{
  const s=net.createServer();
  s.once('error',reject);
  s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))});
 });
}
test('E2E: private bilingual web application, static assets and evidence gate', {timeout:16000},async t=>{
 const temp=await mkdtemp(path.join(os.tmpdir(),'aegis-smoke-'));
 const port=await freePort();
 const base='http://127.0.0.1:'+port;
 const password='test-password-'+randomBytes(10).toString('hex');
 const secret=randomBytes(32).toString('hex');
 const proc=spawn(process.execPath,['server.mjs'],{cwd:path.join(path.dirname(fileURLToPath(import.meta.url)),'..'),env:{...process.env,PORT:String(port),ADMIN_PASSWORD:password,SESSION_SECRET:secret,DATA_DIR:temp},stdio:['ignore','pipe','pipe']});
 let stderr='';proc.stderr.on('data',x=>{stderr+=x.toString()});
 t.after(async()=>{proc.kill('SIGTERM');await rm(temp,{recursive:true,force:true})});
 let ready=false;
 for(let i=0;i<75;i++){
  if(proc.exitCode!==null)break;
  try{const r=await fetch(base+'/api/health');if(r.ok&&(await r.json()).ok){ready=true;break}}catch{}
  await sleep(80);
 }
 assert.ok(ready,'server did not start: '+stderr);
 for(const [url,contains] of [['/','/premium.css'],['/premium.css','--amber'],['/locale.js','aegis_language'],['/aegis-emblem.svg','<svg'],['/ottawa-silhouette.svg','<svg'],['/app.js','function overview']]){
  const r=await fetch(base+url);assert.equal(r.status,200,url);assert.ok((await r.text()).includes(contains),url+' did not contain required asset');
 }

 // The evaluator-facing tour is accessible anonymously, but no private data can leak.
 for(const [url,required] of [['/tour','/tour.js'],['/tour.html','SYNTHETIC'],['/tour.css','--accent'],['/tour.js','/api/public/demo']]){
  const r=await fetch(base+url);assert.equal(r.status,200,'public tour '+url);
  assert.ok((await r.text()).includes(required),'public tour resource missing '+required);
 }
 const publicDemo=await fetch(base+'/api/public/demo');
 assert.equal(publicDemo.status,200);
 assert.equal(publicDemo.headers.get('set-cookie'),null,'public simulation must never set auth cookies');
 const publicPayload=await publicDemo.json();
 assert.equal(publicPayload.synthetic,true);
 assert.equal(publicPayload.evidenceCredited,false);
 assert.equal(publicPayload.readOnly,true);
 assert.equal(publicPayload.result.summary.historicalAssessmentsReexecuted,1);
 assert.equal(publicPayload.result.summary.changedTechnicalFindings,2);
 assert.equal(publicPayload.result.summary.regulatoryComplianceStatus,'UNABLE_TO_DETERMINE');
 assert.equal(publicPayload.result.reassessmentQueue.length,3);
 assert.deepEqual(publicPayload.result.affectedSystemIds,['synthetic-A']);
 assert.deepEqual(publicPayload.result.unaffectedSystemIds,['synthetic-B']);
 assert.match(publicPayload.result.receiptHash,/^sha256:[a-f0-9]{64}$/);
 assert.equal((await fetch(base+'/api/public/demo',{method:'POST'})).status,405);
 assert.equal((await fetch(base+'/api/assurance/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'integrated',input:{}})})).status,401,'public access cannot run arbitrary assurance inputs');

 for(const [uri,text] of [['/workbench','Assurance Workbench'],['/workbench.css','--gold'],['/workbench.js','assurance/report-detail']]){
  const resource=await fetch(base+uri);assert.equal(resource.status,200,uri);
  assert.ok((await resource.text()).includes(text),'new workbench resource '+uri);
 }
 assert.equal((await fetch(base+'/api/assurance/isc-matrix')).status,401);
 assert.equal((await fetch(base+'/api/assurance/report-detail',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lang:'en',input:integratedFixture()})})).status,401);
 assert.equal((await fetch(base+'/api/state')).status,401,'private data must require login');
 const bad=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:'wrong'})});
 assert.equal(bad.status,401);
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
 assert.equal(login.status,200);
 const cookie=login.headers.get('set-cookie')?.split(';')[0];
 assert.ok(cookie?.startsWith('aegis_session='));
 const headers={Cookie:cookie,'Content-Type':'application/json'};

 const iscMatrix=await (await fetch(base+'/api/assurance/isc-matrix',{headers})).json();
 assert.equal(iscMatrix.gates.length,6);
 assert.equal((await fetch(base+'/api/assurance/impact-experiment-demo')).status,401);
 const impactDemo=await (await fetch(base+'/api/assurance/impact-experiment-demo',{headers})).json();
 assert.equal(impactDemo.synthetic,true);
 assert.equal(impactDemo.referenceLabelsIndependentlyVerified,false);
 assert.equal(impactDemo.fixture.cases.length,8);
 const benchmarkResponse=await fetch(base+'/api/assurance/run',{
  method:'POST',headers,body:JSON.stringify({mode:'impact-experiment',input:impactDemo.fixture})
 });
 assert.equal(benchmarkResponse.status,200);
 const benchmarkPayload=await benchmarkResponse.json();
 assert.equal(benchmarkPayload.evidenceCredited,false);
 assert.equal(benchmarkPayload.result.kind,'compiled-policy-impact-benchmark');
 assert.equal(benchmarkPayload.result.referenceLabelsIndependentlyVerified,false);
 assert.deepEqual([
  benchmarkPayload.result.metrics.tp,benchmarkPayload.result.metrics.fp,
  benchmarkPayload.result.metrics.tn,benchmarkPayload.result.metrics.fn
 ],[3,1,3,1]);
 assert.equal(benchmarkPayload.result.metrics.precision,0.75);
 assert.equal(benchmarkPayload.result.metrics.recall,0.75);
 assert.equal(benchmarkPayload.result.trl5EvidenceEstablished,false);

 assert.equal(iscMatrix.selfAssessedOnly,true);
 assert.equal(iscMatrix.trl.claimedLevel,null);
 const preCaseReport=await fetch(base+'/api/assurance/report-detail',{method:'POST',headers,body:JSON.stringify({lang:'en',input:integratedFixture()})});
 assert.equal(preCaseReport.status,200);
 assert.match(preCaseReport.headers.get('content-type'),/text\/html/);
 assert.match(preCaseReport.headers.get('content-disposition'),/aegis-assurance-technical-en/);
 const preHtml=await preCaseReport.text();
 assert.match(preHtml,/No operator review has been recorded/);
 assert.match(preHtml,/UNABLE TO DETERMINE/);
 assert.match(preHtml,/synthetic/i);
 assert.doesNotMatch(preHtml,/onclick=/);
 assert.match(preHtml,/Print command/);
 assert.match(preCaseReport.headers.get('content-security-policy'),/default-src 'none'/);
 assert.match(preCaseReport.headers.get('content-security-policy'),/style-src 'unsafe-inline'/);

 assert.equal((await fetch(base+'/api/assurance/report-detail',{method:'POST',headers,body:JSON.stringify({lang:'fa',input:integratedFixture()})})).status,400);
 const malformed=integratedFixture();malformed.policy.after.version='fabricated-incorrect-version';
 assert.equal((await fetch(base+'/api/assurance/report-detail',{method:'POST',headers,body:JSON.stringify({lang:'en',input:malformed})})).status,400);
 const initial=await (await fetch(base+'/api/state',{headers})).json();
 assert.equal(initial.derived.score,0);
 assert.equal(initial.derived.openGates.length,10);
 const rating=await fetch(base+'/api/rating',{method:'POST',headers,body:JSON.stringify({id:'Q3b',value:20})});
 assert.equal(rating.status,200);
 assert.equal((await rating.json()).derived.score,0,'user-rated score without real reviewed evidence must remain zero');
 const gate=await fetch(base+'/api/gate',{method:'POST',headers,body:JSON.stringify({id:'M-TRL',value:'passed'})});
 assert.equal(gate.status,400,'mandatory gate cannot pass without evidence');
 assert.equal((await fetch(base+'/api/assurance/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'data',input:{records:[],schema:{name:'string'}}})})).status,401);
 const exp=await fetch(base+'/api/assurance/run',{method:'POST',headers,body:JSON.stringify({mode:'classifier',input:{labels:[1,0,1],predictions:[1,1,1]}})});
 assert.equal(exp.status,200);
 const experimental=await exp.json();
 assert.equal(experimental.status,'EXPERIMENTAL_ONLY');assert.equal(experimental.evidenceCredited,false);
 assert.equal(experimental.result.metrics.tp,2);
 const goldenRequest=await fetch(base+'/api/assurance/run',{method:'POST',headers,body:JSON.stringify({mode:'golden-replay',input:createGoldenFixture()})});
 assert.equal(goldenRequest.status,200,'golden replay accessible only under authenticated experimental lab');
 const golden=await goldenRequest.json();
 assert.equal(golden.evidenceCredited,false);
 assert.equal(golden.result.assessmentsReplayed.length,1);
 assert.equal(golden.result.assessmentsReplayed[0].controlChanges[0].recomputedAfter.finding,'NOT_MET');
 const policyRun=await fetch(base+'/api/assurance/run',{method:'POST',headers,body:JSON.stringify({mode:'policy-impact',input:policyImpactFixture()})});
 assert.equal(policyRun.status,200);
 const policyResult=await policyRun.json();
 assert.equal(policyResult.evidenceCredited,false);
 assert.equal(policyResult.result.proposedControls[0].complianceFinding,'UNABLE_TO_DETERMINE');
 assert.equal(policyResult.result.reassessmentQueue.length,3);
 const scopeRequest=await fetch(base+'/api/assurance/run',{method:'POST',headers,body:JSON.stringify({mode:'aia-scope',input:{
  systemId:'synthetic-decision-assistant-01',jurisdiction:'FEDERAL_CANADA',
  stage:'PRE_PRODUCTION',decisionImpact:'ADMINISTRATIVE_RIGHTS_OR_INTERESTS',
  aiDecisionRole:'SUPPORTS',changedAspects:['FUNCTIONALITY'],lastAiaReviewAt:'2026-10-31'
 }})});
 assert.equal(scopeRequest.status,200);
 const scope=await scopeRequest.json();
 assert.equal(scope.evidenceCredited,false);
 assert.equal(scope.result.inferredTriage,'POTENTIALLY_IN_SCOPE_REQUIRES_REVIEW');
 assert.equal(scope.result.aiaReviewFlag,'SCHEDULE_AUTHORIZED_AIA_REVIEW');
 assert.equal(scope.result.legalApplicabilityConfirmed,false);
 const calibrated=await fetch(base+'/api/assurance/run',{method:'POST',headers,body:JSON.stringify({mode:'binary-calibration',input:{
  datasetVersion:'test-ds',modelVersion:'test-model',probabilities:[0.1,0.9],labels:[0,1]
 }})});
 assert.equal(calibrated.status,200);
 const cal=await calibrated.json();
 assert.equal(cal.evidenceCredited,false);
 assert.equal(cal.result.metrics.brierScore,0.01);
 assert.equal(cal.result.complianceFinding,'UNABLE_TO_DETERMINE');
 const grounded=await fetch(base+'/api/assurance/run',{method:'POST',headers,body:JSON.stringify({mode:'grounded-claims',input:{
  datasetVersion:'test-ds',modelVersion:'test-model',cases:[{id:'c',referenceFacts:['checked fact'],outputClaims:['checked fact','unsupported'],abstained:false}]
 }})});
 assert.equal(grounded.status,200);
 assert.equal((await grounded.json()).result.metrics.totalUnsupported,1);


 assert.ok(policyResult.result.proposedControls.every(c=>c.isActive===false));
 // AEGIS-103 policy provenance and lifecycle are restricted to the signed-in admin.
 assert.equal((await fetch(base+'/api/assurance/sources')).status,401);
 assert.equal((await fetch(base+'/api/assurance/governed-demo')).status,401);
 const catalog=await (await fetch(base+'/api/assurance/sources',{headers})).json();
 assert.ok(catalog.sources.length>=5);
 assert.equal(catalog.officialFullDocumentHashesVerified,false);
 assert.equal(catalog.approvedRegulatoryMappings,0);
 const governed=await (await fetch(base+'/api/assurance/governed-demo',{headers})).json();
 assert.equal(governed.synthetic,true);
 const historical=await fetch(base+'/api/assurance/run',{method:'POST',headers,body:JSON.stringify({mode:'governed-lifecycle',input:governed.fixture})});
 assert.equal(historical.status,200);
 const lifecycle=await historical.json();
 assert.equal(lifecycle.evidenceCredited,false);
 assert.equal(lifecycle.result.completedNativeReplays,1);
 assert.equal(lifecycle.result.lifecyclePlans.length,3);
 assert.equal(lifecycle.result.lifecyclePlans.find(x=>x.phase==='IN_PROGRESS').decision.selectedPolicyVersion,null);
 assert.equal(lifecycle.result.lifecyclePlans.find(x=>x.phase==='PLANNED').decision.selectedPolicyVersion,null);
 assert.equal(lifecycle.result.regulatoryStatus,'UNABLE_TO_DETERMINE');
 const forged=structuredClone(governed.fixture);
 forged.trustedReviewerKeys=[{id:'self-authorized',publicKeyPem:'NOT_TRUSTED'}];
 const noClientKey=await (await fetch(base+'/api/assurance/run',{method:'POST',headers,body:JSON.stringify({mode:'governed-lifecycle',input:forged})})).json();
 assert.equal(noClientKey.result.technicalApprovalChecks.filter(x=>x.status==='TECHNICAL_MAPPING_SIGNATURE_VALID').length,0);

 // Authenticated multi-engine demo, internal case hash and reviewer event chain.
 assert.equal((await fetch(base+'/api/assurance/demo')).status,401);
 assert.equal((await fetch(base+'/api/assurance/cases',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:integratedFixture()})})).status,401);
 assert.equal((await fetch(base+'/api/assurance/scenarios')).status,401);
 const library=await (await fetch(base+'/api/assurance/scenarios',{headers})).json();
 assert.equal(library.synthetic,true);
 assert.equal(library.scenarios.length,3);
 assert.equal(library.defaultId,'combined');
 const modelScenario=library.scenarios.find(x=>x.id==='model');
 const modelResponse=await fetch(base+'/api/assurance/run',{
  method:'POST',headers,body:JSON.stringify({mode:'integrated',input:modelScenario.fixture})
 });
 assert.equal(modelResponse.status,200);
 const modelOutcome=await modelResponse.json();
 assert.equal(modelOutcome.evidenceCredited,false);
 assert.equal(modelOutcome.result.summary.changedTechnicalFindings,0);
 assert.equal(modelOutcome.result.summary.historicalAssessmentsReexecuted,2);
 const dataScenario=library.scenarios.find(x=>x.id==='data');
 const dataResponse=await fetch(base+'/api/assurance/run',{
  method:'POST',headers,body:JSON.stringify({mode:'integrated',input:dataScenario.fixture})
 });
 assert.equal(dataResponse.status,200);
 assert.equal((await dataResponse.json()).result.summary.changedTechnicalFindings,1);
 const demo=await (await fetch(base+'/api/assurance/demo',{headers})).json();
 assert.equal(demo.synthetic,true);
 assert.equal(demo.fixture.scenarioId,'synthetic-integrated-001');
 const caseRes=await fetch(base+'/api/assurance/cases',{method:'POST',headers,body:JSON.stringify({input:demo.fixture})});
 assert.equal(caseRes.status,200);
 const casePayload=await caseRes.json();
 assert.equal(casePayload.evidenceCredited,false);
 assert.equal(casePayload.result.summary.historicalAssessmentsReexecuted,1);
 assert.equal(casePayload.result.summary.regulatoryComplianceStatus,'UNABLE_TO_DETERMINE');
 const receipt=casePayload.case.receiptHash;
 const caseAgain=await (await fetch(base+'/api/assurance/cases',{method:'POST',headers,body:JSON.stringify({input:demo.fixture})})).json();
 assert.equal(caseAgain.created,false,'exact same case must not be duplicated');
 const invalidReview=await fetch(base+'/api/assurance/reviews',{method:'POST',headers,body:JSON.stringify({caseReceiptHash:receipt,decision:'APPROVE',reviewerDisplayName:'Test Operator',reason:'no'})});
 assert.equal(invalidReview.status,400,'short reason must fail');
 const unauthorizedReview=await fetch(base+'/api/assurance/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caseReceiptHash:receipt,decision:'APPROVE',reviewerDisplayName:'Test Operator',reason:'Approved without login'})});
 assert.equal(unauthorizedReview.status,401);
 const review=await fetch(base+'/api/assurance/reviews',{method:'POST',headers,body:JSON.stringify({caseReceiptHash:receipt,decision:'REQUEST_CHANGES',reviewerDisplayName:'Internal Tester',reason:'This needs an independently reviewed policy snapshot'})});
 assert.equal(review.status,200);
 const logged=await review.json();
 assert.equal(logged.independentReviewer,false);
 assert.equal(logged.event.scope,'INTERNAL_OPERATOR_COMMENT_ONLY');
 const postCaseFrReport=await fetch(base+'/api/assurance/report-detail',{method:'POST',headers,body:JSON.stringify({lang:'fr',input:integratedFixture()})});
 assert.equal(postCaseFrReport.status,200);
 const postFrHtml=await postCaseFrReport.text();
 assert.match(postFrHtml,/lang="fr-CA"/);
 assert.match(postFrHtml,/Réévaluation native/);
 assert.match(postFrHtml,/REQUEST_CHANGES/);
 assert.match(postFrHtml,/This needs an independently reviewed policy snapshot/);
 assert.ok(postFrHtml.includes(logged.event.eventHash));
 assert.ok(postFrHtml.includes(receipt));

 const cases=await (await fetch(base+'/api/assurance/cases',{headers})).json();
 assert.equal(cases.cases.length,1);
 assert.equal(cases.events.length,1);
 assert.equal(cases.events[0].caseReceiptHash,receipt);
 assert.equal((await fetch(base+'/api/assurance/report?lang=fr')).status,401);
 const frReport=await fetch(base+'/api/assurance/report?lang=fr',{headers});
 assert.equal(frReport.status,200);
 const frHtml=await frReport.text();
 assert.match(frHtml,/lang="fr-CA"/);
 assert.match(frHtml,/Révision interne/);
 assert.match(frHtml,/INTERNAL|REQUEST_CHANGES/);
 assert.equal((await fetch(base+'/api/assurance/report?lang=fa',{headers})).status,400);
 const savedLedger=JSON.parse(await (await import('node:fs/promises')).readFile(path.join(temp,'aegis-assurance-reviews.json'),'utf8'));
 assert.equal(savedLedger.cases.length,1);
 assert.equal(savedLedger.events.length,1);
 assert.ok(!JSON.stringify(savedLedger).includes('Synthetic tolerance'), 'raw synthetic inputs must not be stored by review ledger');



 const invalid=await fetch(base+'/api/assurance/run',{method:'POST',headers,body:JSON.stringify({mode:'classifier',input:{labels:[1],predictions:[1,0]}})});
 assert.equal(invalid.status,400);
 const afterNative=await (await fetch(base+'/api/state',{headers})).json();
 assert.equal(afterNative.derived.score,0,'experimental AI metrics never change the evidence score');
 const exportRes=await fetch(base+'/api/export?format=json',{headers});
 assert.equal(exportRes.status,200);
 const payload=await exportRes.json();assert.equal(payload.derived.score,0);
});
