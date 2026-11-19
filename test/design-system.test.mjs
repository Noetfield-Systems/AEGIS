import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('real external MIT Tabler dependency is pinned and locally served without mutable CDN',async()=>{
 const p=JSON.parse(await read('package.json'));
 assert.equal(p.dependencies['@tabler/core'],'1.5.1');
 const server=await read('server.mjs');
 assert.match(server,/node_modules\/\@tabler\/core\/dist\/css\/tabler\.min\.css/);
 assert.match(server,/url\.pathname==='\/vendor\/tabler\.min\.css'/);
 const icons=await read('public/tabler-icons.svg');
 assert.match(icons,/Tabler Icons/);
 for(const glyph of ['ti-layout-dashboard','ti-flask','ti-shield-check','ti-sun','ti-moon','ti-menu-2','ti-x'])assert.ok(icons.includes(glyph),glyph);
});

test('one canonical dark/light/system theme controls workbench, authentication and public console',async()=>{
 const theme=await read('public/theme.js');
 assert.match(theme,/aegis_color_mode_v1/);
 assert.match(theme,/data-bs-theme/);
 assert.match(theme,/prefers-color-scheme: dark/);
 assert.match(theme,/\['dark','light','system'\]/);
 assert.match(theme,/localStorage\.setItem/);
 assert.match(theme,/addEventListener\('storage'/);
 for(const f of ['public/index.html','public/workbench.html','public/tour.html']){
  const html=await read(f);
  assert.match(html,/src="\/theme\.js"/);
  assert.match(html,/href="\/vendor\/tabler\.min\.css"/);
 }
 const wb=await read('public/workbench.html'),login=await read('public/app.js'),tour=await read('public/tour.html');
 assert.match(wb,/data-theme-choice="light"/);
 assert.match(wb,/data-theme-choice="dark"/);
 assert.match(wb,/data-theme-choice="system"/);
 assert.match(login,/data-theme-toggle/);
 assert.match(tour,/data-theme-toggle/);
});

test('Workbench is structurally responsive, preserves native data and has accessible mobile navigation',async()=>{
 const [html,css,js]=await Promise.all(['public/workbench.html','public/workbench-system.css','public/workbench.js'].map(read));
 assert.match(html,/id="mobile-menu"/);
 assert.match(html,/id="workbench-sidebar"/);
 assert.match(html,/id="workbench-backdrop"/);
 assert.match(html,/aria-controls="workbench-sidebar"/);
 assert.match(js,/function closeWorkbenchNav/);
 assert.match(js,/aria-expanded/);
 assert.match(js,/wb-receipt-short/);
 assert.match(js,/wb-version/);
 assert.match(css,/@media\(max-width:900px\)/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/grid-template-columns:258px minmax\(0,1fr\)/);
 assert.match(css,/transform:translateX\(-105%\)/);
 assert.match(css,/\.form-control/);
 assert.match(css,/html\[data-aegis-theme="light"\]/);
 assert.doesNotMatch(html+js,/[\u0600-\u06ff]/);
});

test('Authentication is premium, usable at 390px and French localization covers new controls',async()=>{
 const [html,css,app,locale]=await Promise.all(['public/index.html','public/login-system.css','public/app.js','public/locale.js'].map(read));
 assert.match(html,/href="\/login-system\.css"/);
 assert.match(app,/login-evidence-preview/);
 assert.match(app,/form-control/);
 assert.match(css,/@media\(max-width:820px\)/);
 assert.match(css,/@media\(max-width:480px\)/);
 assert.match(css,/html\[data-aegis-theme="light"\]/);
 assert.match(locale,/Bienvenue dans AEGIS/);
 assert.match(locale,/Chaque décision/);
});

test('Canonical design system is documented and names the real upstream, not a guessed imitation',async()=>{
 const docs=await read('docs/DESIGN_SYSTEM.md');
 assert.match(docs,/Tabler UI/);
 assert.match(docs,/1\.5\.1/);
 assert.match(docs,/MIT/);
 assert.match(docs,/Dark \/ Light \/ System/);
 assert.match(docs,/workbench-system\.css/);
 assert.match(docs,/login-system\.css/);
});
