/**
 * Zero-dependency real Chromium UX smoke: desktop and mobile, EN/FR first paint,
 * actual private login, native evaluation and evidence lineage. Screenshots contain
 * synthetic test data ONLY. No live production credentials are used.
 */
import {spawn,spawnSync} from 'node:child_process';
import {readFile,writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {setTimeout as sleep} from 'node:timers/promises';
import {randomBytes} from 'node:crypto';
import net from 'node:net';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
async function port(){
 const server=net.createServer();
 await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
 const n=server.address().port;await new Promise(r=>server.close(r));return n;
}
async function wait(predicate,message,limit=14000){
 const started=Date.now();let last;
 while(Date.now()-started<limit){
  try{const result=await predicate();if(result)return result}catch(e){last=e}
  await sleep(125);
 }
 throw Error(message+(last?' / '+last.message:''));
}
const chromeBins=[process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
const chrome=chromeBins.map(x=>x.includes('/')?x:spawnSync('which',[x],{encoding:'utf8'}).stdout.trim()).find(x=>x&&existsSync(x));
assert(chrome,'No Chrome/Chromium executable available; do not claim browser validation.');
const root=await mkdtemp(path.join(os.tmpdir(),'aegis-browser-quality-'));
const screenshots=path.resolve('artifacts/browser-quality');
await mkdir(screenshots,{recursive:true});
const appPort=await port(),base='http://127.0.0.1:'+appPort;
const password='browser-test-'+randomBytes(16).toString('hex');
const server=spawn(process.execPath,['server.mjs'],{
 cwd:process.cwd(),env:{...process.env,PORT:String(appPort),ADMIN_PASSWORD:password,
 SESSION_SECRET:randomBytes(32).toString('hex'),DATA_DIR:path.join(root,'data')},
 stdio:['ignore','pipe','pipe']
});
let serverErr='';
server.stderr.on('data',x=>serverErr+=x.toString());
let browser=null,ws=null;
try{
 await wait(async()=>{const r=await fetch(base+'/api/health');return r.ok},'Server did not become ready: '+serverErr);
 const browserDir=path.join(root,'chrome');
 browser=spawn(chrome,[
  '--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--disable-gpu','--disable-background-networking','--no-first-run',
  '--hide-scrollbars','--remote-debugging-port=0',
  '--user-data-dir='+browserDir,'about:blank'
 ],{stdio:['ignore','pipe','pipe']});
 let browserError='';browser.stderr.on('data',x=>browserError+=x.toString().slice(-2000));
 const active=await wait(async()=>{
  const f=path.join(browserDir,'DevToolsActivePort');
  if(!existsSync(f))return null;
  const lines=(await readFile(f,'utf8')).split('\n');
  return lines[0]&&/^\d+$/.test(lines[0])?Number(lines[0]):null;
 },'Chrome remote debugging did not start: '+browserError);
 const target=await wait(async()=>{
  const response=await fetch('http://127.0.0.1:'+active+'/json/list');
  const items=await response.json();return items.find(x=>x.type==='page')?.webSocketDebuggerUrl||null;
 },'Chrome page target unavailable');
 ws=new WebSocket(target);
 await new Promise((resolve,reject)=>{
  ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});
 });
 let id=0;const inFlight=new Map();
 ws.addEventListener('message',event=>{
  const message=JSON.parse(event.data);
  if(!message.id)return;
  const pending=inFlight.get(message.id);if(!pending)return;
  inFlight.delete(message.id);
  message.error?pending.reject(Error(message.error.message)):pending.resolve(message.result||{});
 });
 function command(method,params={}){
  return new Promise((resolve,reject)=>{
   const sequence=++id;inFlight.set(sequence,{resolve,reject});
   ws.send(JSON.stringify({id:sequence,method,params}));
  });
 }
 async function evaluate(source){
  const data=await command('Runtime.evaluate',{expression:source,returnByValue:true,awaitPromise:true});
  if(data.exceptionDetails)throw Error('Runtime exception: '+JSON.stringify(data.exceptionDetails).slice(0,400));
  return data.result?.value;
 }
 async function navigate(url){
  await command('Page.navigate',{url:base+url});
  await wait(async()=>await evaluate('document.readyState==="complete"')===true,'Page did not load '+url);
 }
 async function screenshot(file){
  const {data}=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,fromSurface:true});
  assert(data,'Screenshot unavailable '+file);await writeFile(path.join(screenshots,file),Buffer.from(data,'base64'));
 }
 const persian=/[\u0600-\u06FF]/;
 await command('Page.enable');await command('Runtime.enable');
 await command('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await navigate('/');
 await wait(async()=>await evaluate('!!document.querySelector("#demo-content") && !document.querySelector("#demo-content").hidden'),'Public command center did not render');
 assert(await evaluate('document.querySelectorAll("[data-screen]").length')===7,'Public enterprise navigation missing');
 assert(await evaluate('document.querySelector("#stat-findings").textContent')==='2','Public native KPI failed');
 await screenshot('00-enterprise-command-center-desktop.png');
 await evaluate('document.querySelector(\'[data-view="systems"]\').click()');
 assert(await evaluate('document.querySelector(\'[data-screen="systems"]\').classList.contains("active")'),'Systems view not interactive');
 await evaluate('document.querySelector(\'[data-filter="affected"]\').click()');
 assert(await evaluate('document.querySelector("#system-count-label").textContent.startsWith("1 ")'),'Affected-system filter incorrect');
 await screenshot('00b-enterprise-inventory-desktop.png');
 await evaluate('document.querySelector(\'[data-view="evaluation"]\').click()');
 assert(await evaluate('document.querySelectorAll("#findings-rows tr").length')===2,'Native findings view missing');
 await screenshot('00c-enterprise-evaluation-desktop.png');
 await evaluate('document.querySelector("#locale").click()');
 await wait(async()=>await evaluate('document.documentElement.lang==="fr-CA" && document.body.innerText.includes("Laboratoire d’évaluation")'),'Public French localization did not translate the active view');
 assert(!(await evaluate('document.body.innerText')).match(/[\u0600-\u06FF]/),'Public French contained Persian copy');
 await screenshot('00d-enterprise-evaluation-fr-desktop.png');
 await evaluate('document.querySelector("#locale").click()');
 await wait(async()=>await evaluate('document.documentElement.lang==="en-CA"'),'Public English locale not restored');
 await navigate('/login');
 await wait(async()=>await evaluate('!!document.querySelector("#login-form")'),'Private login did not render');
 let body=await evaluate('document.body.innerText');
 assert(!persian.test(body),'Legacy English login rendered Persian.');
 assert(body.includes('Welcome to AEGIS.'),'Premium Tabler login copy missing.');
 await screenshot('01-premium-login-en-dark.png');
 await evaluate('document.querySelector("[data-theme-toggle]").click()');
 await wait(async()=>await evaluate('document.documentElement.dataset.bsTheme==="light"'),'Login light mode did not activate');
 await screenshot('01b-premium-login-en-light.png');
 await evaluate('document.querySelector("[data-theme-toggle]").click()');
 await wait(async()=>await evaluate('document.documentElement.dataset.bsTheme==="dark"'),'Login dark mode did not restore');
 const restricted=await evaluate('(async()=> (await fetch("/api/assurance/cases")).status)()');
 assert(restricted===401,'Unauthenticated case registry became accessible');
 // Language-toggle really reloads and changes the visible page, not just document.lang.
 await evaluate('document.querySelector("#lang-toggle").click()');
 await wait(async()=>await evaluate('document.documentElement.lang==="fr-CA" && document.body.innerText.includes("Bienvenue dans AEGIS.")'),'Legacy fr-CA login not translated');
 body=await evaluate('document.body.innerText');
 assert(!persian.test(body),'Legacy French login rendered Persian.');
 await screenshot('02-premium-login-fr-dark.png');
 await evaluate('document.querySelector("#lang-toggle").click()');
 await wait(async()=>await evaluate('document.documentElement.lang==="en-CA" && !!document.querySelector("#login-form")'),'English locale not restored');
 const loginStatus=await evaluate('(async()=> (await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:'+JSON.stringify(password)+'})})).status)()');
 assert(loginStatus===200,'Local authorized login failed');
 await navigate('/workbench');
 await wait(async()=>await evaluate('!!document.querySelector("#app") && !document.querySelector("#app").hidden'),'Private workbench did not load');
 body=await evaluate('document.body.innerText');
 assert(!persian.test(body),'English private workbench rendered Persian.');
 await screenshot('03-workbench-context-desktop.png');
 assert(await evaluate('document.querySelector("#wb-version").textContent.includes("v2")'),'Versioned policy metadata not visible');
 await evaluate('document.querySelector(".appearance-select summary").click();document.querySelector("[data-theme-choice=light]").click()');
 await wait(async()=>await evaluate('document.documentElement.dataset.bsTheme==="light"'),'Workbench light appearance failed');
 await screenshot('03b-workbench-context-light.png');
 await evaluate('document.querySelector(".appearance-select summary").click();document.querySelector("[data-theme-choice=dark]").click()');
 await wait(async()=>await evaluate('document.documentElement.dataset.bsTheme==="dark"'),'Workbench dark appearance failed');
 await evaluate('document.querySelector(\'[data-step="evaluate"]\').click();document.querySelector("#run").click();');
 await wait(async()=>await evaluate('!document.querySelector("#eval-results").hidden && document.querySelectorAll("#lineage-nodes .lineage-node").length===6'),'Native evaluation and real provenance did not render');
 const finding=await evaluate('document.querySelector("#m-changed").textContent');
 assert(finding==='2','Native change findings not displayed');
 await screenshot('04-workbench-lineage-desktop.png');
 // A second, real native scenario must change results; it must not reuse cached fake KPIs.
 await evaluate('document.querySelector(\'[data-step="context"]\').click();');
 await evaluate('document.querySelector("#scenario-select").value="model";document.querySelector("#scenario-load").click();');
 await wait(async()=>await evaluate('document.querySelector("#case-scenario").textContent==="synthetic-model-threshold"'),'Scenario selector did not update the model and source');
 await evaluate('document.querySelector(\'[data-step="evaluate"]\').click();document.querySelector("#run").click();');
 await wait(async()=>await evaluate('!document.querySelector("#eval-results").hidden && document.querySelector("#m-changed").textContent==="0"'),'Second model-only native result did not differ from first case');
 await screenshot('04b-workbench-model-no-false-failure.png');
 await evaluate('document.querySelector("#lineage-nodes [data-go=review]").click()');
 assert(await evaluate('!document.querySelector(\'[data-screen="review"]\').hidden'),'Trace navigation to review is broken');
 // Verify French dynamic stage navigation and no Persian visible.
 await evaluate('document.querySelector("#locale").click()');
 await wait(async()=>await evaluate('document.documentElement.lang==="fr-CA"'),'Workbench French switch failed');
 body=await evaluate('document.body.innerText');
 assert(!persian.test(body),'French private workbench rendered Persian.');
 await screenshot('05-workbench-review-fr-desktop.png');
 await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await navigate('/workbench');
 await wait(async()=>await evaluate('!!document.querySelector("#app") && !document.querySelector("#app").hidden'),'Mobile workbench did not load');
 await evaluate('document.querySelector("#mobile-menu").click()');
 assert(await evaluate('document.querySelector("#workbench-sidebar").classList.contains("is-open")'),'Workbench mobile offcanvas failed to open');
 assert(await evaluate('document.querySelector("#mobile-menu").getAttribute("aria-expanded")')==='true','Workbench drawer accessibility state missing');
 await screenshot('06a-workbench-mobile-menu.png');
 await evaluate('document.querySelector("#workbench-backdrop").click()');
 assert(!(await evaluate('document.querySelector("#workbench-sidebar").classList.contains("is-open")')),'Mobile offcanvas did not dismiss');
 await sleep(300); // Let the upstream offcanvas transition settle before full-page capture.
 assert(await evaluate('document.querySelector("#mobile-menu").getAttribute("aria-expanded")')==='false','Drawer aria-expanded remained open');

 await evaluate('document.querySelector(\'[data-step="evaluate"]\').click();document.querySelector("#run").click();');
 await wait(async()=>await evaluate('!document.querySelector("#eval-results").hidden'),'Mobile evaluation did not execute');

 await evaluate('window.scrollTo({left:0,top:0,behavior:"instant"})');
 await sleep(320);
 const geometry=await evaluate('(()=>{const $=s=>document.querySelector(s)?.getBoundingClientRect(),a=$("#workspace"),b=$(".heading h1"),c=$(".main.page-wrapper");return {viewport:innerWidth,scrollX:scrollX,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,workspaceLeft:a?.left,workspaceRight:a?.right,headingLeft:b?.left,headingRight:b?.right,mainLeft:c?.left,mainRight:c?.right}})()');
 console.log('AEGIS_MOBILE_GEOMETRY',JSON.stringify(geometry));
 assert(Math.abs(geometry.scrollX)<=1,'Mobile viewport scrolled horizontally: '+JSON.stringify(geometry));
 assert(geometry.workspaceLeft>=-1&&geometry.workspaceRight<=geometry.viewport+2,'Workbench mobile content clipped: '+JSON.stringify(geometry));
 assert(geometry.headingLeft>=-1&&geometry.headingRight<=geometry.viewport+2,'Workbench translated heading clipped: '+JSON.stringify(geometry));
 const width=await evaluate('({viewport:innerWidth,document:document.documentElement.scrollWidth})');
 assert(width.document<=width.viewport+3,'Mobile workbench horizontal overflow: '+JSON.stringify(width));
 await screenshot('06-workbench-lineage-mobile.png');
 await evaluate('document.querySelector("[data-theme-toggle]")?.click()');
 await evaluate('window.AegisTheme.set("light")');
 assert(await evaluate('document.documentElement.dataset.bsTheme')==='light','Mobile system theme not applied');
 const widthLight=await evaluate('({viewport:innerWidth,document:document.documentElement.scrollWidth})');
 assert(widthLight.document<=widthLight.viewport+3,'Mobile light mode overflow '+JSON.stringify(widthLight));
 await screenshot('06b-workbench-lineage-mobile-light.png');
 for(const width of [320,390,768,1024,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:860,deviceScaleFactor:1,mobile:width<900});
  await sleep(175);
  const g=await evaluate('({viewport:innerWidth,scroll:scrollX,document:document.documentElement.scrollWidth,content:document.querySelector("#workspace").getBoundingClientRect().right})');
  assert(g.document<=g.viewport+3&&g.scroll<2,'Workbench breakpoint overflow at '+width+': '+JSON.stringify(g));
  if(width===320)await screenshot('06c-workbench-320px-light.png');
 }
 await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});

 await evaluate('window.AegisTheme.set("dark")');
 await navigate('/tour');
 await evaluate('document.querySelector("#menu-button").click()');
 assert(await evaluate('document.querySelector("#sidebar").classList.contains("open")'),'Mobile sidebar did not open');
 await evaluate('document.querySelector("#backdrop").click()');
 assert(!(await evaluate('document.querySelector("#sidebar").classList.contains("open")')),'Mobile backdrop did not close sidebar');
 await wait(async()=>await evaluate('!!document.querySelector("#demo-content") && !document.querySelector("#demo-content").hidden'),'Public command center did not render native result');
 assert(await evaluate('document.querySelector("#stat-findings").textContent')==='2','Mobile command center did not populate');
 await screenshot('07a-command-center-mobile-overview.png');
 await evaluate('document.querySelector(\'[data-view="evidence"]\').click()');
 assert(await evaluate('document.querySelector(\'[data-screen="evidence"]\').classList.contains("active")'),'Mobile evidence view did not activate');
 const compact=await evaluate('({viewport:innerHeight,header:document.querySelector(".topbar").getBoundingClientRect().height,metrics:document.querySelector(".metrics-row").getBoundingClientRect().top})');
 assert(compact.metrics<compact.viewport,'Mobile operational metrics must be visible in first viewport: '+JSON.stringify(compact));
 const nodes=await evaluate('document.querySelectorAll("#tour-lineage-nodes .trace-card").length');
 assert(nodes===6,'Public evaluator trace sequence did not render');
 const widthTour=await evaluate('({viewport:innerWidth,document:document.documentElement.scrollWidth})');
 assert(widthTour.document<=widthTour.viewport+3,'Mobile public tour horizontal overflow: '+JSON.stringify(widthTour));
 await screenshot('07b-command-center-mobile-evidence.png');
 console.log('CHROMIUM_QA_PASS EN/FR legacy login, private auth, native evidence, interactive lineage, 390px mobile and public tour');
 console.log('Browser evidence screenshots saved to '+screenshots);
}finally{
 if(ws)ws.close();
 if(browser){browser.kill('SIGTERM');await sleep(200);if(browser.exitCode===null)browser.kill('SIGKILL');}
 server.kill('SIGTERM');
 await rm(root,{recursive:true,force:true});
}
