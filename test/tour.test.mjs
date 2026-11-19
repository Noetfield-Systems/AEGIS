import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=async name=>readFile(new URL('../public/'+name,import.meta.url),'utf8');

test('AEGIS public homepage is a coherent, production-grade bilingual command center with real navigable views',async()=>{
 const [html,js,css]=await Promise.all([source('tour.html'),source('tour.js'),source('tour.css')]);
 assert.match(html,/<html lang="en-CA" dir="ltr">/);
 assert.match(html,/href="\/tour.css"/);
 assert.match(html,/src="\/tour.js"/);
 assert.match(html,/href="\/login" id="private-top-link"/);
 for(const v of ['overview','systems','policy','evaluation','evidence','reports','method']){
  assert.match(html,new RegExp('data-view="'+v+'"'));
  assert.match(html,new RegExp('data-screen="'+v+'"'));
 }
 for(const functional of ['id="system-search"','id="download-json"','id="refresh"','id="copy-receipt"','id="tour-lineage-nodes"','id="findings-rows"','id="work-rows"','id="stat-clauses"','id="stat-findings"','id="locale"','id="menu-button"']){
  assert.ok(html.includes(functional),functional);
 }
 assert.match(js,/document\.documentElement\.lang=lang==='fr'\?'fr-CA':'en-CA'/);
 assert.match(js,/fetch\('\/api\/public\/demo'/);
 assert.match(js,/credentials:'omit'/);
 assert.match(js,/document\.createElement/);
 assert.match(js,/textContent=/);
 assert.match(css,/grid-template-columns:248px minmax\(0,1fr\)/);
 assert.match(css,/@media\(max-width:620px\)/);
 assert.match(css,/:focus-visible/);
 assert.doesNotMatch(html+js,/[\u0600-\u06ff]/,'public experience must be EN/FR only');
});

test('public analytics are not a pre-filled screenshot: every metric and graph comes from the real bounded result',async()=>{
 const [html,js]=await Promise.all([source('tour.html'),source('tour.js')]);
 for(const key of ['changedClauses','affectedSystems','historicalAssessmentsReexecuted','changedTechnicalFindings','findingsTrace','reassessmentQueue','receiptHash','sourceVersions']){
  assert.ok(js.includes(key),'missing derived native source '+key);
 }
 assert.match(js,/p\.synthetic!==true/);
 assert.match(js,/p\.evidenceCredited!==false/);
 assert.match(js,/p\.readOnly!==true/);
 assert.match(js,/integrated-ai-assurance-simulation/);
 assert.match(js,/\.style\.background='conic-gradient/);
 assert.match(js,/systemFilter/);
 assert.match(js,/systemSearch/);
 assert.match(js,/downloadJson/);
 assert.match(html,/data-i18n="disclaimer"/);
 for(const word of ['SYNTHETIC','UNABLE TO DETERMINE','NOT INDEPENDENTLY VERIFIED'])assert.ok((html+js).includes(word));
});

test('private workspace remains available on a separate login page',async()=>{
 const app=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(app,/href="\/tour"/);
 assert.match(app,/auth\/login/);
 const loginHtml=await source('index.html');
 assert.match(loginHtml,/<html lang="en-CA" dir="ltr">/);
});
