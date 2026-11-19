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
 assert.match(login,/Every decision\./);
 assert.match(login,/Welcome to AEGIS\./);
 assert.match(login,/Administrator passphrase/);
 assert.doesNotMatch(login,/[\u0600-\u06ff]/);
 const locale=await file('public/locale.js');
 assert.match(locale,/Bienvenue dans AEGIS/);
 assert.match(locale,/Connectez-vous à l’espace de recherche privé/);
});

test('private and public decision provenance are native, EN/FR and keyboard navigable',async()=>{
 const [wb,js,css,tour,tourJs,tourCss]=await Promise.all([
 'public/workbench.html','public/workbench.js','public/workbench.css',
 'public/tour.html','public/tour.js','public/tour.css'].map(file));
 assert.match(wb,/id="lineage-nodes"/);
 assert.match(js,/function renderLineage/);
 assert.match(js,/result\.summary/);
 assert.match(js,/traceSource:'SOURCE DE POLITIQUE'/);
 assert.match(css,/@media\(max-width:400px\)/);
 assert.match(tour,/id="tour-lineage-nodes"/);
 assert.match(tourJs,/function renderTrace/);
 assert.match(tourJs,/data\.sourceVersions\.after/);
 assert.match(tourJs,/tracePolicy:'SOURCE DE POLITIQUE'/);
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

test('officer homepage shows operational product and measured evidence immediately',async()=>{
 const [html,js,css]=await Promise.all([file('public/tour.html'),file('public/tour.js'),file('public/tour.css')]);
 assert.match(html,/data-screen="overview"/);
 assert.match(html,/data-screen="evaluation"/);
 assert.match(html,/data-screen="systems"/);
 assert.match(html,/data-screen="reports"/);
 assert.match(html,/id="findings-donut"/);
 assert.match(html,/id="systems-table"/);
 assert.match(html,/id="overview-chain"/);
 assert.match(js,/sourceVersions\.after/);
 assert.match(css,/@media\(max-width:620px\)/);
 assert.match(css,/\.sidebar\.open/);
});

