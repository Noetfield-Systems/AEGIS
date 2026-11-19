import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runNative} from '../assurance/native.mjs';
import {integratedFixture} from '../fixtures/integrated.mjs';
import {renderIntegratedReport} from '../assurance/integrated-report.mjs';
const file=async p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('officer-facing private login has a genuinely English first paint',async()=>{
 const app=await file('public/app.js');
 const login=app.slice(app.indexOf('function login('),app.indexOf('el(\'#login-form\').onsubmit',app.indexOf('function login(')));
 assert.match(login,/From assessment scores,/);
 assert.match(login,/Enter the AEGIS workspace/);
 assert.match(login,/Administrator passphrase/);
 assert.doesNotMatch(login,/[\u0600-\u06ff]/);
 const locale=await file('public/locale.js');
 assert.match(locale,/Accéder à l’espace AEGIS/);
 assert.match(locale,/Cet environnement de recherche contient des dossiers/);
});

test('private and public decision lineage are computed, responsive, EN/FR and keyboard reachable',async()=>{
 const files=await Promise.all(['public/workbench.html','public/workbench.js','public/workbench.css','public/tour.html','public/tour.js','public/tour.css'].map(file));
 const [wb,js,css,tour,tourJs,tourCss]=files;
 assert.match(wb,/id="lineage-nodes"/);
 assert.match(wb,/data-t="lineageBoundary"/);
 assert.match(js,/function renderLineage/);
 assert.match(js,/result\.summary/);
 assert.match(js,/lineage-node/);
 assert.match(js,/traceSource:'SOURCE DE POLITIQUE'/);
 assert.match(js,/lineage-nodes'\)\.addEventListener\('click'/);
 assert.match(css,/@media\(max-width:400px\)/);
 assert.match(tour,/id="tour-lineage-nodes"/);
 assert.match(tourJs,/function renderTrace/);
 assert.match(tourJs,/data\.sourceVersions\.after/);
 assert.match(tourJs,/tracePolicy:'VERSION DE POLITIQUE'/);
 assert.match(tourCss,/@media\(max-width:620px\)/);
 assert.doesNotMatch(wb+js+tour+tourJs,/[\u0600-\u06ff]/);
});

test('downloadable report is print-ready without dangerous script execution',async()=>{
 const server=await file('server.mjs');
 const output=renderIntegratedReport(runNative({mode:'integrated',input:integratedFixture()}),{lang:'en'});
 const french=renderIntegratedReport(runNative({mode:'integrated',input:integratedFixture()}),{lang:'fr'});
 assert.doesNotMatch(output,/onclick=/);
 assert.doesNotMatch(french,/<script/i);
 assert.match(output,/Print command/);
 assert.match(french,/commande Imprimer/);
 assert.match(output,/@media print/);
 assert.match(server,/style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'/);
});
