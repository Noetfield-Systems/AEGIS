import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createLoginGuard,createSessionRegistry,cookieValue,csvSafeCell} from '../security/auth.mjs';

const secret='s'.repeat(64);

test('login lockout has a finite expiry; a new window allows valid credentials',()=>{
 let now=1_800_000_000_000;
 const g=createLoginGuard({secret,clock:()=>now,limit:3,windowMs:60_000});
 const key=g.keyFor('', '10.0.0.1','TestAgent 1');
 assert.equal(g.blocked(key),false);
 for(let i=0;i<3;i++)g.failed(key);
 assert.equal(g.blocked(key),true);
 now+=60_001;
 assert.equal(g.blocked(key),false,'stale counter must reset when the window expires');
 g.failed(key);assert.equal(g.blocked(key),false,'failed count starts at one, not four');
 g.success(key);assert.equal(g.blocked(key),false);
});

test('separate signed client cookies isolate logins behind one shared reverse-proxy address',()=>{
 let now=1_800_000_000_000;
 const g=createLoginGuard({secret,clock:()=>now,limit:2});
 const cookieA=g.clientCookie(true),cookieB=g.clientCookie(true);
 const a=g.keyFor(cookieA,'127.0.0.1','same-agent');
 const b=g.keyFor(cookieB,'127.0.0.1','same-agent');
 assert.notEqual(a,b);
 assert.ok(cookieA.includes('Secure')&&cookieA.includes('HttpOnly'));
 g.failed(a);g.failed(a);
 assert.equal(g.blocked(a),true);
 assert.equal(g.blocked(b),false,'other clients must remain able to sign in');
 const attacker=g.keyFor(cookieA.replace('aegis_login_client=','aegis_login_client=tampered-'),'127.0.0.1','same-agent');
 assert.notEqual(attacker,a,'tampered client cookie cannot select another client bucket');
 const legacyA=g.keyFor('','127.0.0.1','Agent-A');
 const legacyB=g.keyFor('','127.0.0.1','Agent-B');
 assert.notEqual(legacyA,legacyB,'proxy IP must not be the sole fallback key');
});

test('CSV export neutralizes formula triggers, including leading whitespace, without altering JSON evidence',()=>{
 for(const raw of ['=1+1','+SUM(1,1)','-1+2','@HYPERLINK("https://example.org")',' \t=CMD','\r=FORMULA','\n+SUM(2,2)','\uFEFF=2+2']){
  const cell=csvSafeCell(raw);
  assert.ok(cell.startsWith('"\''),'escaped a spreadsheet formula: '+JSON.stringify(raw));
  assert.ok(cell.endsWith('"'));
 }
 assert.equal(csvSafeCell('Normal result'),'"Normal result"');
 assert.equal(csvSafeCell('He said "hi"'),'"He said ""hi"""');
 assert.equal(csvSafeCell('https://example.org/x'),'"https://example.org/x"');
 assert.equal(csvSafeCell(null),'""');
});

test('authenticated cookie is revocable, survives process restart, and invalidates on credential rotation',async t=>{
 let now=1_800_000_000_000;
 const dir=await mkdtemp(path.join(os.tmpdir(),'aegis-auth-v32-'));
 t.after(()=>rm(dir,{recursive:true,force:true}));
 const config={dir,secret,adminPassword:'an-internal-passphrase',clock:()=>now,ttlMs:60_000};
 let store=await createSessionRegistry(config);
 const issued=await store.issue(true),cookie=issued.split(';')[0];
 assert.match(cookie,/^aegis_session=v2\./);
 assert.ok(issued.includes('Secure;')||issued.includes('; Secure'));
 assert.equal(store.valid(cookie),true);
 assert.equal(store.valid(cookie.replace('v2.','v3.')),false);
 const saved=JSON.parse(await readFile(path.join(dir,'aegis-auth-sessions.json'),'utf8'));
 assert.equal(saved.sessions.length,1);
 store=await createSessionRegistry(config);
 assert.equal(store.valid(cookie),true,'restart must preserve authorized session under the same credentials');
 assert.equal(await store.revoke(cookie),true);
 assert.equal(store.valid(cookie),false,'a replayed stolen cookie must be rejected after logout');
 store=await createSessionRegistry(config);
 assert.equal(store.valid(cookie),false,'revocation must survive server restart');
 const second=(await store.issue(false)).split(';')[0];
 assert.equal(store.valid(second),true);
 const rotated=await createSessionRegistry({...config,adminPassword:'new-rotated-admin-pass'});
 assert.equal(rotated.valid(second),false,'changing the admin credential must revoke all issued sessions');
 const after=JSON.parse(await readFile(path.join(dir,'aegis-auth-sessions.json'),'utf8'));
 assert.equal(after.sessions.length,0);
 const third=(await rotated.issue(false)).split(';')[0];
 assert.equal(rotated.valid(third),true);
 now+=60_001;
 assert.equal(rotated.valid(third),false,'session expiry must be enforced');
});

test('authentication registry corruptions fail closed rather than silently clearing confidential records',async t=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'aegis-auth-corrupt-'));
 t.after(()=>rm(dir,{recursive:true,force:true}));
 const file=path.join(dir,'aegis-auth-sessions.json');
 const {writeFile}=await import('node:fs/promises');
 await writeFile(file,'{ invalid JSON','utf8');
 await assert.rejects(()=>createSessionRegistry({dir,secret,adminPassword:'pass-phrase'}),SyntaxError);
});
