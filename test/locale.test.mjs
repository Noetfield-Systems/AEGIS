import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const files = async path => readFile(new URL('../'+path,import.meta.url),'utf8');
async function loadLocale(saved=null) {
 const script=await files('public/locale.js');
 const documentElement={lang:null,dir:null,dataset:{}};
 const document={documentElement,readyState:'loading',addEventListener(){}};
 let persisted=saved, reloads=0;
 const localStorage={getItem:()=>persisted,setItem:(_key,val)=>{persisted=val}};
 const window={location:{reload:()=>{reloads++}}};
 vm.runInNewContext(script,{document,window,localStorage}, {filename:'locale.js',timeout:3000});
 return {locale:window.aegisLocale,documentElement,get saved(){return persisted},get reloads(){return reloads}};
}

test('AEGIS starts in Canadian English and never restores legacy Farsi',async()=>{
 for(const old of [null,'fa','FA','other','']) {
  const {locale,documentElement}=await loadLocale(old);
  assert.equal(locale.language(),'en');
  assert.equal(documentElement.lang,'en-CA');
  assert.equal(documentElement.dir,'ltr');
  assert.equal(locale.translate('ورود به فضای AEGIS'),'Enter AEGIS');
  assert.equal(locale.translate('از یک امتیازنامه،'),'From a scorecard');
  assert.equal(locale.translate('به یک پرونده قابل دفاع.'),'to a defensible evidence dossier.');
  assert.equal(locale.translate('رمز دسترسی مدیر'),'Administrator password');
  assert.equal(locale.translate('۱۳۰'),'130');
 }
});

test('French locale covers login, rubric, forms, data labels and policy-scoped content',async()=>{
 const {locale,documentElement}=await loadLocale('fr');
 assert.equal(locale.language(),'fr');
 assert.equal(documentElement.lang,'fr-CA');
 assert.equal(documentElement.dir,'ltr');
 assert.equal(locale.translate('ورود به فضای AEGIS'),'Accéder à AEGIS');
 assert.equal(locale.translate('از یک امتیازنامه،'),'D’une grille de notation');
 assert.equal(locale.translate('به یک پرونده قابل دفاع.'),'à un dossier de preuves défendable.');
 assert.equal(locale.translate('رمز دسترسی مدیر'),'Mot de passe administrateur');
 assert.equal(locale.translate('رجیستری شواهد'),'Registre des preuves');
 assert.equal(locale.translate('EVIDENCE OPERATIONS / 2026'),'OPÉRATIONS DE PREUVE / 2026');
 assert.equal(locale.translate('WORKSPACE ACCESS'),'ACCÈS À L’ESPACE PRIVÉ');
 assert.equal(locale.translate('پنج چارچوب و پنج وضعیت'),'Cinq cadres et cinq états');
 assert.equal(locale.translate('تعهد مستند'),'Engagement documenté');
 assert.equal(locale.translate('۱۳۰'),'130');
});

test('language change is restricted to en/fr and performs a normal page reload',async()=>{
 const t=await loadLocale('en');
 t.locale.chooseLocale('fa');
 assert.equal(t.saved,'en');
 assert.equal(t.reloads,0);
 t.locale.chooseLocale('fr');
 assert.equal(t.saved,'fr');
 assert.equal(t.reloads,1);
});

test('all registered interface expressions have explicit non-Persian EN/FR equivalents',async()=>{
 const script=await files('public/locale.js');
 const config=JSON.parse(script.match(/const CONFIG=(\{[\s\S]*?\});\nconst map=/)[1]);
 for(const [fa,en] of Object.entries(config.dict)){
  assert.ok(!/[\u0600-\u06ff]/.test(en), 'English translation has Persian: '+fa);
  if(!en.trim())continue;
  assert.ok(typeof config.fr[en]==='string','French translation missing: '+en);
  assert.ok(!/[\u0600-\u06ff]/.test(config.fr[en]),'French translation has Persian: '+en);
 }
});

test('HTML and CSS use EN/FR LTR, not Persian or RTL as default',async()=>{
 const [html,css,app]=await Promise.all([files('public/index.html'),files('public/premium.css'),files('public/app.js')]);
 assert.match(html,/<html lang="en-CA" dir="ltr">/);
 assert.doesNotMatch(html,/lang="fa"|dir="rtl"|Vazirmatn|بارگذاری/);
 assert.match(css,/html\[data-lang\] \.side/);
 assert.match(app,/toLocaleString\(window\.aegisLocale/);
 assert.doesNotMatch(app,/toLocaleString\('fa-IR'\)/);
});

test('static UI fragments including hero and the Company OS render without Persian',async()=>{
 const {locale}=await loadLocale('en');
 const app=await files('public/app.js');
 const htmlText=[...app.matchAll(/>([^<>\n]*[\u0600-\u06ff][^<>\n]*)</g)]
  .map(x=>x[1].replace(/\$\{[^}]*\}/g,'').trim()).filter(Boolean);
 for(const text of htmlText){
  if(!/[\u0600-\u06ff]/.test(text))continue;
  if(/['`]/.test(text))continue; // unmatched JS template boundaries: not live text nodes
  assert.ok(!/[\u0600-\u06ff]/.test(locale.translate(text)), 'Untranslated UI: '+text);
 }
});
