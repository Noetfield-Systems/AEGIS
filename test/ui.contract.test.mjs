import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const f=async p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('premium and bilingual assets are present in the app and served by server',async()=>{
 const [html,server,css,locale]=await Promise.all(['public/index.html','server.mjs','public/premium.css','public/locale.js'].map(f));
 for(const asset of ['/premium.css','/locale.js']){assert.ok(html.includes(asset));assert.ok(server.includes(asset))}
 assert.match(css,/#d6ae74/i);
 assert.match(locale,/aegis_language/);
});
test('deployment requirements preserve secret-only auth and persistent data',async()=>{
 const server=await f('server.mjs');assert.match(server,/SESSION_SECRET/);assert.match(server,/ADMIN_PASSWORD/);assert.match(server,/DATA_DIR/);assert.ok(server.includes('/api/state'));assert.match(server,/authorized\(req\)/);
});
test('agent operating contract never claims scheduled issues are coding receipts',async()=>{
 const file=await f('scripts/daily-operations.mjs');
 assert.match(file,/not an autonomous code/);assert.match(file,/health/);assert.match(file,/SINA_OS_DISPATCH_URL/);
});
