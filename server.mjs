import http from 'node:http';
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID,timingSafeEqual} from 'node:crypto';
import {createLoginGuard,createSessionRegistry,csvSafeCell} from './security/auth.mjs';
import {seed,evaluate,CRITERIA,GATES,SOURCE,NOTICE,DEADLINE,normalizeEntity,isReviewed} from './model.mjs';
import {runNative} from './assurance/native.mjs';
import {getSourceRegistry} from './assurance/source-registry.mjs';
import {governedFixture} from './fixtures/governed.mjs';
import {integratedFixture} from './fixtures/integrated.mjs';
import {scenarioLibrary} from './fixtures/scenario-library.mjs';
import {impactExperimentFixture} from './fixtures/impact-experiment.mjs';
import {emptyReviewJournal,verifyReviewJournal,appendCase,appendReview,renderReviewReport} from './assurance/review-journal.mjs';
import {renderIntegratedReport} from './assurance/integrated-report.mjs';
import {buildOfficerEvidencePack} from './assurance/officer-pack.mjs';
import {getCandidatePolicyMapping} from './assurance/policy-mapping.mjs';
import {adapterKinds,validateAdapterBatch} from './assurance/interop.mjs';
import {interoperabilitySamples} from './fixtures/interop.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const dataDir=process.env.DATA_DIR||path.join(root,'data');
const storeFile=path.join(dataDir,'aegis-isc.json');
const reviewFile=path.join(dataDir,'aegis-assurance-reviews.json');
const admin=process.env.ADMIN_PASSWORD;
const key=process.env.SESSION_SECRET;
if(!admin||admin.length<12||!key||key.length<32){console.error('ADMIN_PASSWORD (>=12 chars) and SESSION_SECRET (>=32 chars) required.');process.exit(1)}
const port=Number(process.env.PORT||3000);
// Only server operators may configure reviewer trust anchors. Caller JSON is not trusted.
let trustedReviewerKeys=[];
if(process.env.AEGIS_TRUSTED_REVIEW_KEYS_JSON){
 try{trustedReviewerKeys=JSON.parse(process.env.AEGIS_TRUSTED_REVIEW_KEYS_JSON);if(!Array.isArray(trustedReviewerKeys)||trustedReviewerKeys.length>30)throw Error('invalid trusted keys');}
 catch{console.error('AEGIS_TRUSTED_REVIEW_KEYS_JSON must be a valid, bounded array');process.exit(1)}
}
let state;let mutex=Promise.resolve();
await mkdir(dataDir,{recursive:true,mode:0o700});
const loginGuard=createLoginGuard({secret:key});
const authSessions=await createSessionRegistry({dir:dataDir,secret:key,adminPassword:admin});
try {state=JSON.parse(await readFile(storeFile,'utf8'));if(!state||state.schema!==1)throw Error('Unknown store schema');}catch(e){if(e.code!=='ENOENT')throw e;state=seed();await safeSave(state)}
async function safeSave(s){const f=storeFile+'.'+randomUUID()+'.tmp';await writeFile(f,JSON.stringify(s,null,2),{mode:0o600});await rename(f,storeFile)}

let reviewJournal=emptyReviewJournal(),reviewMutex=Promise.resolve();
try{
 reviewJournal=JSON.parse(await readFile(reviewFile,'utf8'));
 verifyReviewJournal(reviewJournal);
}catch(e){if(e.code!=='ENOENT')throw e;}
async function persistJournal(next){
 const tmp=reviewFile+'.'+randomUUID()+'.tmp';
 await writeFile(tmp,JSON.stringify(next,null,2),{mode:0o600});
 await rename(tmp,reviewFile);
 reviewJournal=next;
}
function updateJournal(update){
 const job=reviewMutex.then(async()=>{const x=update(reviewJournal);if(x.journal!==reviewJournal)await persistJournal(x.journal);return x;});
 reviewMutex=job.then(()=>{},()=>{});return job;
}

function eq(a,b){const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&timingSafeEqual(x,y)}
function secure(req){return req.headers['x-forwarded-proto']==='https'||Boolean(req.socket.encrypted)}
function authorized(req){return authSessions.valid(req.headers.cookie)}
function respond(res,status,payload,extra={}){const text=JSON.stringify(payload);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra});res.end(text)}
async function body(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>160_000)throw Error('حجم درخواست بیش از حد است.');raw+=chunk.toString('utf8')}let x;try{x=JSON.parse(raw||'{}')}catch{throw Error('JSON نامعتبر است.')}if(!x||typeof x!=='object'||Array.isArray(x))throw Error('بدنه نامعتبر است.');return x}
function originOkay(req){const o=req.headers.origin;if(!o)return true;try{return new URL(o).host===req.headers.host}catch{return false}}
async function mutate(op,actor='operator'){
 const job=mutex.then(async()=>{const s=structuredClone(state);const before=evaluate(s).score;const info=await op(s);const after=evaluate(s).score;const at=new Date().toISOString();
 s.audit=[...(s.audit||[]),{id:randomUUID(),at,actor,action:info?.action||'update',target:info?.target||'',previousScore:before,nextScore:after}].slice(-1200);
 s.history=[...(s.history||[]),{at,score:after,reason:info?.action||'ویرایش'}].slice(-1000);
 await safeSave(s);state=s;return {state:s,derived:evaluate(s),...info};});
 mutex=job.then(()=>{},()=>{});return job;
}
// Public interactive workbench uses only these fixed synthetic fixtures. No API
// endpoint here accepts arbitrary evaluation inputs or accesses persistent records.
const publicPreviewCases=Object.freeze(scenarioLibrary().map(({id,name,nameFr,description,descriptionFr,synthetic,fixture})=>
 ({id,name,nameFr,description,descriptionFr,synthetic,fixture})));
const publicPreviewResults=new Map(publicPreviewCases.map(s=>[s.id,runNative({mode:'integrated',input:s.fixture})]));
const publicPreviewImpact=runNative({mode:'impact-experiment',input:impactExperimentFixture()});
const publicDemonstration=runNative({mode:'integrated',input:integratedFixture()});
const publicDemoEnvelope=Object.freeze({
 synthetic:true,evidenceCredited:false,readOnly:true,sourcePolicyOfficiallyVerified:false,
 disclaimer:'Synthetic, precomputed first-party demonstration; no government compliance or TRL claim',
 result:{kind:publicDemonstration.kind,scenarioId:publicDemonstration.scenarioId,
  sourceVersions:publicDemonstration.sourceVersions,
  affectedSystemIds:publicDemonstration.affectedSystemIds,
  unaffectedSystemIds:publicDemonstration.unaffectedSystemIds,
  findingsTrace:publicDemonstration.findingsTrace,
  reassessmentQueue:publicDemonstration.reassessmentQueue,
  summary:publicDemonstration.summary,receiptHash:publicDemonstration.receiptHash}
});
const files={'/theme.js':'theme.js','/workbench-system.css':'workbench-system.css','/tour-system.css':'tour-system.css','/login-system.css':'login-system.css','/tabler-icons.svg':'tabler-icons.svg','/':'tour.html','/login':'index.html','/index.html':'index.html','/app.js':'app.js','/style.css':'style.css','/premium.css':'premium.css','/locale.js':'locale.js','/aegis-emblem.svg':'aegis-emblem.svg','/ottawa-silhouette.svg':'ottawa-silhouette.svg','/tour':'tour.html','/tour.html':'tour.html','/tour.css':'tour.css','/tour.js':'tour.js','/workbench':'workbench.html','/workbench.html':'workbench.html','/workbench.css':'workbench.css','/workbench.js':'workbench.js'};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');res.setHeader('Cache-Control','no-store');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; connect-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
 if(secure(req))res.setHeader('Strict-Transport-Security','max-age=31536000; includeSubDomains');
 const url=new URL(req.url,'http://localhost');
 try{
  // Self-host the pinned Tabler 1.5.1 CSS; no third-party CDN or runtime external dependency.
  if(url.pathname==='/vendor/tabler.min.css'&&req.method==='GET'){
   const data=await readFile(path.join(root,'node_modules/@tabler/core/dist/css/tabler.min.css'));
   res.writeHead(200,{'Content-Type':'text/css; charset=utf-8','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'});return res.end(data);
  }
  if(url.pathname==='/api/health'){return respond(res,200,{ok:true,app:'aegis-isc',version:'1.1.0',persistence:'file'})}
  if(url.pathname==='/api/auth/status'&&req.method==='GET')
   return respond(res,200,{authenticated:authorized(req),identityMode:'SINGLE_OPERATOR'});
  if(url.pathname==='/api/public/workbench'){
   if(req.method!=='GET')return respond(res,405,{error:'Read-only public preview'},{Allow:'GET'});
   const matrix=JSON.parse(await readFile(path.join(root,'ops/isc-e1-e6-matrix.json'),'utf8'));
   return respond(res,200,{synthetic:true,evidenceCredited:false,readOnly:true,precomputed:true,
    defaultId:'combined',scenarios:publicPreviewCases,sourceRegistry:getSourceRegistry(),
    iscMatrix:matrix,privateCasesIncluded:false,
    disclaimer:'Fixed synthetic example only, not independent evaluation, legal compliance, customer evidence or a TRL finding.'});
  }
  if(url.pathname==='/api/public/workbench-result'){
   if(req.method!=='GET')return respond(res,405,{error:'Read-only public preview'},{Allow:'GET'});
   const scenarioId=url.searchParams.get('scenario')||'combined',result=publicPreviewResults.get(scenarioId);
   if(!result)return respond(res,400,{error:'Unknown synthetic scenario'});
   return respond(res,200,{synthetic:true,evidenceCredited:false,readOnly:true,precomputed:true,result});
  }
  if(url.pathname==='/api/public/impact-preview'){
   if(req.method!=='GET')return respond(res,405,{error:'Read-only public preview'},{Allow:'GET'});
   return respond(res,200,{synthetic:true,evidenceCredited:false,readOnly:true,precomputed:true,
    referenceLabelsIndependentlyVerified:false,result:publicPreviewImpact});
  }
  if(url.pathname==='/api/public/workbench-report'){
   if(req.method!=='GET')return respond(res,405,{error:'Read-only public preview'},{Allow:'GET'});
   const lang=url.searchParams.get('lang')||'en',scenarioId=url.searchParams.get('scenario')||'combined';
   if(!['en','fr'].includes(lang)||!publicPreviewResults.has(scenarioId))return respond(res,400,{error:'Unknown synthetic report'});
   const html=renderIntegratedReport(publicPreviewResults.get(scenarioId),{lang,generatedAt:'2026-11-19T00:00:00Z'});
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8',
    'Content-Disposition':'attachment; filename="aegis-synthetic-workbench-'+lang+'.html"',
    'Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"});
   return res.end(html);
  }

  // Public static showcase serves a fixed, precomputed synthetic scenario only.
  // Never accept public caller inputs or expose policy/review/evidence records here.
  if(url.pathname==='/api/public/demo'){
   if(req.method!=='GET')return respond(res,405,{error:'Method not allowed'},{Allow:'GET'});
   return respond(res,200,publicDemoEnvelope);
  }
  if(url.pathname==='/api/auth/login'&&req.method==='POST'){
   if(!originOkay(req))return respond(res,403,{error:'Origin نامعتبر است.'});
   const actor=loginGuard.keyFor(req.headers.cookie,req.socket.remoteAddress,req.headers['user-agent']);
   if(loginGuard.blocked(actor))return respond(res,429,{error:'Too many login attempts. Try again later.'});
   const p=await body(req);
   if(!eq(p.password,admin)){loginGuard.failed(actor);return respond(res,401,{error:'Invalid passphrase.'})}
   loginGuard.success(actor);
   return respond(res,200,{ok:true},{'Set-Cookie':await authSessions.issue(secure(req))});
  }
  if(url.pathname==='/api/auth/logout'&&req.method==='POST'){
   if(!originOkay(req))return respond(res,403,{error:'Invalid request origin.'});
   await authSessions.revoke(req.headers.cookie);
   return respond(res,200,{ok:true},{'Set-Cookie':'aegis_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'+(secure(req)?'; Secure':'')});
  }
  if(url.pathname.startsWith('/api/')){
   if(!authorized(req))return respond(res,401,{error:'ورود به فضای خصوصی لازم است.'});
   if(req.method!=='GET'&&!originOkay(req))return respond(res,403,{error:'Origin نامعتبر است.'});
   // Experimental assurance lab: authenticated, stateless, read-only, never credits ISC points.
   if(url.pathname==='/api/assurance/run'&&req.method==='POST'){
    try{
     const request=await body(req);
     const result=runNative(request,{trustedReviewerKeys});
     return respond(res,200,{status:'EXPERIMENTAL_ONLY',evidenceCredited:false,result});
    }catch(error){
     if(error instanceof TypeError)return respond(res,400,{error:error.message});
     throw error;
    }
   }

   // Experimental assurance case registry is distinct from the ISC readiness score/evidence store.
   // Only a single local administrator identity exists. Reviewer display names are not verified.
   // Read-only evidence acceptance matrix; this is the self-assessed project document.
   if(url.pathname==='/api/assurance/adapters'&&req.method==='GET')
    return respond(res,200,{schemaVersion:'1.0',adapters:adapterKinds,liveExternalConnectionsVerified:0,
      independentConformanceAttested:false,contractValidationAvailable:true});
   if(url.pathname==='/api/assurance/adapters/examples'&&req.method==='GET')
    return respond(res,200,{synthetic:true,records:interoperabilitySamples});
   if(url.pathname==='/api/assurance/adapters/validate'&&req.method==='POST'){
    try{return respond(res,200,validateAdapterBatch(await body(req)))}
    catch(err){if(err instanceof TypeError||err instanceof RangeError||err instanceof SyntaxError)
      return respond(res,400,{error:err.message});throw err;}
   }
   if(url.pathname==='/api/assurance/policy-mapping'&&req.method==='GET')
    return respond(res,200,getCandidatePolicyMapping());
   if(url.pathname==='/api/assurance/isc-matrix'&&req.method==='GET'){
    const raw=await readFile(path.join(root,'ops/isc-e1-e6-matrix.json'),'utf8');
    return respond(res,200,JSON.parse(raw));
   }
   if(url.pathname==='/api/assurance/officer-pack'&&req.method==='GET'){
    const matrix=JSON.parse(await readFile(path.join(root,'ops/isc-e1-e6-matrix.json'),'utf8'));
    return respond(res,200,buildOfficerEvidencePack(matrix));
   }
   // Recompute the bounded native result for a print-ready, separately credited-zero
   // report. The report only includes measurement lineage; it never archives raw input.
   if(url.pathname==='/api/assurance/report-detail'&&req.method==='POST'){
    try{
     const payload=await body(req),lang=payload.lang||'en';
     if(!['en','fr'].includes(lang))return respond(res,400,{error:'Only en and fr are available'});
     const result=runNative({mode:'integrated',input:payload.input});
     verifyReviewJournal(reviewJournal);
     const recorded=reviewJournal.cases.some(c=>c.receiptHash===result.receiptHash);
     const review=recorded?reviewJournal.events.filter(e=>e.caseReceiptHash===result.receiptHash).at(-1)??null:null;
     const html=renderIntegratedReport(result,{lang,review,generatedAt:new Date().toISOString()});
     res.writeHead(200,{'Content-Type':'text/html; charset=utf-8',
      'Content-Disposition':'attachment; filename="aegis-assurance-technical-'+lang+'.html"',
      'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
      'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"}); 
     return res.end(html);
    }catch(err){if(err instanceof TypeError||err instanceof RangeError)return respond(res,400,{error:err.message});throw err;}
   }
   if(url.pathname==='/api/assurance/sources'&&req.method==='GET')
    return respond(res,200,getSourceRegistry());
   if(url.pathname==='/api/assurance/governed-demo'&&req.method==='GET')
    return respond(res,200,{synthetic:true,fixture:governedFixture()});
   if(url.pathname==='/api/assurance/impact-experiment-demo'&&req.method==='GET')
    return respond(res,200,{synthetic:true,referenceLabelsIndependentlyVerified:false,fixture:impactExperimentFixture()});
   if(url.pathname==='/api/assurance/scenarios'&&req.method==='GET')
    return respond(res,200,{synthetic:true,defaultId:'combined',scenarios:scenarioLibrary()});
   if(url.pathname==='/api/assurance/demo'&&req.method==='GET')
    return respond(res,200,{synthetic:true,fixture:integratedFixture()});
   if(url.pathname==='/api/assurance/cases'&&req.method==='GET'){
    verifyReviewJournal(reviewJournal);
    return respond(res,200,{status:'INTERNAL_EXPERIMENTAL_ONLY',cases:reviewJournal.cases,events:reviewJournal.events,identityMode:'SINGLE_LOCAL_ADMIN'});
   }
   if(url.pathname==='/api/assurance/cases'&&req.method==='POST'){
    try{
     const input=(await body(req)).input;
     const result=runNative({mode:'integrated',input});
     const saved=await updateJournal(j=>appendCase(j,result,new Date().toISOString()));
     return respond(res,200,{status:'EXPERIMENTAL_ONLY',evidenceCredited:false,case:saved.entry,created:saved.created,result});
    }catch(err){if(err instanceof TypeError)return respond(res,400,{error:err.message});throw err;}
   }
   if(url.pathname==='/api/assurance/reviews'&&req.method==='POST'){
    try{
     const payload=await body(req);
     const saved=await updateJournal(j=>appendReview(j,payload,'local-admin',new Date().toISOString()));
     return respond(res,200,{status:'INTERNAL_OPERATOR_REVIEW_ONLY',independentReviewer:false,event:saved.event});
    }catch(err){if(err instanceof TypeError)return respond(res,400,{error:err.message});throw err;}
   }
   if(url.pathname==='/api/assurance/report'&&req.method==='GET'){
    try{
     const locale=url.searchParams.get('lang')||'en';
     const html=renderReviewReport(reviewJournal,locale);
     res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Disposition':'attachment; filename="aegis-assurance-internal-'+locale+'.html"'});
     return res.end(html);
    }catch(err){if(err instanceof TypeError)return respond(res,400,{error:err.message});throw err;}
   }
   if(url.pathname==='/api/state'&&req.method==='GET')return respond(res,200,{state,derived:evaluate(state),meta:{criteria:CRITERIA,gates:GATES,source:SOURCE,notice:NOTICE,deadline:DEADLINE}});
   if(url.pathname==='/api/export'&&req.method==='GET'){
    const t=url.searchParams.get('format');if(t==='csv'){
     const csvCell=csvSafeCell;const cols=['id','title','type','status','url','reviewer','observedAt','criteria','tags','claim','limitations'];
     const csv='\uFEFF'+[cols.join(','),...(state.evidence||[]).map(e=>cols.map(k=>csvCell(Array.isArray(e[k])?e[k].join('|'):e[k])).join(','))].join('\r\n');
     res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="aegis-isc-evidence.csv"'});return res.end(csv);
    }
    res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="aegis-isc-evidence-pack.json"'});return res.end(JSON.stringify({exportedAt:new Date().toISOString(),source:SOURCE,state,derived:evaluate(state)},null,2));
   }
   if(url.pathname==='/api/rating'&&req.method==='POST'){
    const p=await body(req);const c=CRITERIA.find(x=>x.id===p.id);if(!c||!c.options.includes(Number(p.value)))return respond(res,400,{error:'امتیاز خارج از جدول رسمی است.'});
    const r=await mutate(s=>{s.ratings[p.id]=Number(p.value);return {action:'assess-criterion',target:p.id}});return respond(res,200,{state:r.state,derived:r.derived});
   }
   if(url.pathname==='/api/gate'&&req.method==='POST'){
    const p=await body(req);if(!GATES.some(x=>x.id===p.id)||!['unreviewed','passed','failed'].includes(p.value))return respond(res,400,{error:'وضعیت گیت نامعتبر است.'});
    if(p.value==='passed'&&!state.evidence.some(e=>isReviewed(e)&&e.tags?.includes(p.id)))return respond(res,400,{error:'برای PASS ابتدا سند واقعی بازبینی‌شده و مرتبط با این گیت ثبت کنید.'});
    const r=await mutate(s=>{s.gateReviews[p.id]=p.value;return {action:'review-gate',target:p.id}});return respond(res,200,{state:r.state,derived:r.derived});
   }
   if(url.pathname==='/api/record'&&req.method==='POST'){
    const p=await body(req),coll=String(p.collection||'');if(!['evidence','tasks','milestones','people','activities','risks','commercial'].includes(coll))return respond(res,400,{error:'مجموعه نامعتبر است.'});
    const r=await mutate(s=>{const value=normalizeEntity(coll,p.record||{});const i=s[coll].findIndex(x=>x.id===value.id);
     if(coll==='milestones'&&value.status==='done'){
      const model=evaluate(s),proof=(value.linkedEvidence||[]).filter(id=>s.evidence.some(e=>e.id===id&&isReviewed(e)));
      if(!proof.length||model.gateStatuses[value.gate]!=='passed')throw Error('گیت خروج milestone هنوز PASS نشده یا سند بازبینی‌شده ندارد.');
     }
     if(i>=0)s[coll][i]=value;else s[coll].unshift(value);return {action:i>=0?'update-'+coll:'create-'+coll,target:value.id};});
    return respond(res,200,{state:r.state,derived:r.derived});
   }
   if(url.pathname==='/api/delete'&&req.method==='POST'){
    const p=await body(req),coll=String(p.collection||'');if(!['evidence','tasks','people','activities','risks','commercial'].includes(coll))return respond(res,400,{error:'حذف این مجموعه مجاز نیست.'});
    const r=await mutate(s=>{s[coll]=s[coll].filter(x=>x.id!==p.id);return {action:'delete-'+coll,target:p.id}});return respond(res,200,{state:r.state,derived:r.derived});
   }
   return respond(res,404,{error:'API یافت نشد.'});
  }
  if(req.method!=='GET'||!files[url.pathname]){res.writeHead(404);return res.end('Not found')}
  const name=files[url.pathname];const data=await readFile(path.join(root,'public',name));
   const headers={'Content-Type':types[path.extname(name)]};
   if(url.pathname==='/login'||url.pathname==='/index.html')headers['Set-Cookie']=loginGuard.clientCookie(secure(req));
   res.writeHead(200,headers);res.end(data);
 }catch(e){console.error('request failed',e.message);respond(res,/نامعتبر|لازم|الزامی|مجاز|سند|گیت|تاریخ|حجم|خارج|مسئول|عنوان/.test(e.message)?400:500,{error:/نامعتبر|لازم|الزامی|مجاز|سند|گیت|تاریخ|حجم|خارج|مسئول|عنوان/.test(e.message)?e.message:'خطای غیرمنتظره سرور'})}
});
server.listen(port,'0.0.0.0',()=>console.log(`AEGIS ISC listening on :${port}`));