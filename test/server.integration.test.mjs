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
 assert.equal((await fetch(base+'/api/state')).status,401,'private data must require login');
 const bad=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:'wrong'})});
 assert.equal(bad.status,401);
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
 assert.equal(login.status,200);
 const cookie=login.headers.get('set-cookie')?.split(';')[0];
 assert.ok(cookie?.startsWith('aegis_session='));
 const headers={Cookie:cookie,'Content-Type':'application/json'};
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
 assert.ok(policyResult.result.proposedControls.every(c=>c.isActive===false));
 // Authenticated multi-engine demo, internal case hash and reviewer event chain.
 assert.equal((await fetch(base+'/api/assurance/demo')).status,401);
 assert.equal((await fetch(base+'/api/assurance/cases',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:integratedFixture()})})).status,401);
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
