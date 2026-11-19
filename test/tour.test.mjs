import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=async name=>readFile(new URL('../public/'+name,import.meta.url),'utf8');

test('public evaluator walkthrough is strict EN/FR, with language switch and no Persian markup',async()=>{
 const [html,js,css]=await Promise.all([source('tour.html'),source('tour.js'),source('tour.css')]);
 assert.match(html,/<html lang="en-CA" dir="ltr">/);
 assert.match(html,/href="\/tour.css"/);
 assert.match(html,/src="\/tour.js"/);
 assert.match(html,/href="\/"[^>]*>Private workspace/);
 assert.match(html,/id="locale"/);
 assert.match(html,/data-i18n="disclaimer"/);
 assert.match(js,/document\.documentElement\.lang=language==='fr'\?'fr-CA':'en-CA'/);
 assert.match(js,/fetch\('\/api\/public\/demo'/);
 assert.match(js,/credentials:'omit'/);
 assert.doesNotMatch(html+js,/[\u0600-\u06ff]/,'public tour may not show Persian text');
 assert.match(css,/@media\(max-width:520px\)/);
 assert.match(css, /:focus-visible/);
});

test('public demo explicitly distinguishes synthetic measurements from real compliance',async()=>{
 const [html,js]=await Promise.all([source('tour.html'),source('tour.js')]);
 for(const label of ['SYNTHETIC','UNABLE TO DETERMINE','Not independently verified']){
  assert.ok((html+js).includes(label),label+' must be disclosed');
 }
 assert.match(js,/result\.kind!=='integrated-ai-assurance-simulation'/);
 assert.match(js,/payload\.evidenceCredited!==false/);
 assert.match(html,/id="receipt"/);
 assert.match(html,/id="findings-rows"/);
 assert.match(html,/id="work-rows"/);
});

test('login links to the public tour without changing private login flow',async()=>{
 const app=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(app,/href="\/tour"/);
 assert.match(app,/auth\/login/);
});
