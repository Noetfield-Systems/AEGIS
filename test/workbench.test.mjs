import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runNative} from '../assurance/native.mjs';
import {integratedFixture} from '../fixtures/integrated.mjs';
import {renderIntegratedReport} from '../assurance/integrated-report.mjs';

const result=()=>runNative({mode:'integrated',input:integratedFixture()});
test('EN technical report records recomputed metrics, source hashes, policy versions and limitations',()=>{
 const input=result();
 const html=renderIntegratedReport(input,{lang:'en',generatedAt:'2026-11-18T20:00:00Z'});
 assert.match(html,/<html lang="en-CA" dir="ltr">/);
 assert.match(html,/Decision Assurance &amp; Regulatory Replay/);
 assert.ok(html.includes(input.receiptHash));
 assert.ok(html.includes(input.sourceHash));
 assert.ok(html.includes(input.policyImpactHash));
 assert.ok(html.includes(input.nativeReplayHash));
 assert.ok(html.includes(input.sourceVersions.before));
 assert.ok(html.includes(input.sourceVersions.after));
 assert.match(html,/UNABLE TO DETERMINE/);
 assert.match(html,/synthetic/i);
 assert.match(html,/not an independent scientific audit/i);
 assert.match(html,/Assessment Lifecycle|Lifecycle propagation/);
 assert.match(html,/assessment-A-v1/);
 assert.match(html,/C-DATA/);
 assert.match(html,/canada\.ca/);
 assert.doesNotMatch(html,/[\u0600-\u06ff]/);
});
test('French report is substantive bilingual content, not merely a language switch',()=>{
 const input=result();
 const html=renderIntegratedReport(input,{lang:'fr'});
 assert.match(html,/<html lang="fr-CA" dir="ltr">/);
 assert.match(html,/Assurance décisionnelle et relecture réglementaire/);
 assert.match(html,/Réévaluation native/);
 assert.match(html,/Limites scientifiques/);
 assert.match(html,/IMPOSSIBLE À DÉTERMINER/);
 assert.match(html,/gouvernement du Canada/);
 assert.ok(html.includes(input.receiptHash));
});
test('HTML escaping eliminates injected reviewer and system field markup',()=>{
 const x=result();x.findingsTrace[0].assessmentId='<script>alert(1)</script>';
 x.affectedSystemIds.push('<svg/onload=alert(9)>');
 const review={caseReceiptHash:x.receiptHash,decision:'REJECT',
  reviewerDisplayName:'<img src=x onerror=alert(3)>',
  reason:'<script>window.bad=1</script>',recordedAt:'2026-11-18T20:00:00Z',
  eventHash:'sha256:'+'e'.repeat(64)};
 const html=renderIntegratedReport(x,{lang:'en',review});
 assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
 assert.doesNotMatch(html,/<script>window\.bad=1<\/script>/);
 assert.doesNotMatch(html,/<svg\/onload/);
 assert.match(html,/&lt;script&gt;/);
 assert.match(html,/&lt;svg\/onload/);
 assert.match(html,/REJECT/);
});
test('wrong receipt, language, finding state or uncredited contract fails closed',()=>{
 const x=result();
 assert.throws(()=>renderIntegratedReport(x,{lang:'fa'}),/language must be en or fr/);
 assert.throws(()=>renderIntegratedReport(x,{review:{caseReceiptHash:'fake'}}),/receipt must match/);
 assert.throws(()=>renderIntegratedReport({...x,iscEvidenceCredited:true}),/non-credited/);
 const mutated=structuredClone(x);mutated.findingsTrace[0].recomputedCurrent='CERTIFIED';
 assert.throws(()=>renderIntegratedReport(mutated),/unknown finding/);
});

test('premium guided workbench contains six actual stages and dual language localization',async()=>{
 const files=await Promise.all(['public/workbench.html','public/workbench.js','public/workbench.css'].map(async f=>readFile(new URL('../'+f,import.meta.url),'utf8')));
 const [html,js,css]=files;
 assert.match(html,/<html lang="en-CA" dir="ltr">/);
 assert.match(html,/data-step="context"/);
 for(const step of ['context','policy','evaluate','review','report','coverage'])assert.ok(html.includes('data-screen="'+step+'"'));
 assert.match(html,/id="run"/);
 assert.match(html,/id="review-form"/);
 assert.match(html,/data-report="en"/);
 assert.match(html,/data-report="fr"/);
 assert.match(js,/assurance\/report-detail/);
 assert.match(js,/assurance\/isc-matrix/);
 assert.match(js,/assurance\/cases/);
 assert.match(js,/assurance\/reviews/);
 assert.match(js,/assurance\/run/);
 assert.match(js,/languageKey='aegis_workbench_language'/);
 assert.match(js,/lang=language==='fr'\?'fr-CA':'en-CA'/);
 assert.match(css,/@media\(max-width:580px\)/);
 assert.match(css,/:focus-visible/);
 assert.doesNotMatch(html+js,/[\u0600-\u06ff]/,'website is EN/FR only');
});
