import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {captureOfficialSource,officialUrl} from '../assurance/source-archive.mjs';
const url='https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592';
const fixture='<html lang="en"><body>Test fixture, NOT actual government policy</body></html>';
const fixtureResponse=async()=>new Response(fixture,{status:200,headers:{'content-type':'text/html; charset=utf-8'}});
test('captures exact source bytes with SHA; no automated expert approval',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'aegis-archive-'));
 try{
  const options={sourceId:'DIRECTIVE_ADM',url,destinationDirectory:dir,fetcher:fixtureResponse,retrievedAt:'2026-11-19T00:00:00Z'};
  const result=await captureOfficialSource(options);
  const bytes=await readFile(path.join(dir,result.snapshotFilename));
  const manifest=JSON.parse(await readFile(path.join(dir,result.manifestFilename),'utf8'));
  assert.equal(bytes.toString('utf8'),fixture);
  assert.equal(result.sha256,'sha256:'+createHash('sha256').update(bytes).digest('hex'));
  assert.deepEqual(result,manifest);
  assert.equal(result.expertMappingApproved,false);
  assert.equal(result.applicability,'UNDETERMINED');
  assert.equal(result.iscEvidenceCredited,false);
  assert.deepEqual(await captureOfficialSource(options),result);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('rejects unsafe or forged government origins',()=>{
 for(const raw of ['http://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592',
  'https://evil.com/','https://canada.ca.evil.com/','https://foo@www.tbs-sct.canada.ca/',
  'https://canada.ca/#part']){
  assert.throws(()=>officialUrl(raw),TypeError);
 }
 assert.equal(officialUrl(url).protocol,'https:');
});
test('follows government-only redirects and rejects off-domain redirects',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'aegis-archive-'));
 try{
  const fetcher=async current=>current===url
   ?new Response(null,{status:302,headers:{location:'/newpolicy'}})
   :new Response(fixture,{status:200,headers:{'content-type':'text/html'}});
  const result=await captureOfficialSource({sourceId:'DIRECTIVE_ADM',url,destinationDirectory:dir,fetcher});
  assert.equal(result.redirectChain.length,1);
  assert.equal(result.finalUrl,'https://www.tbs-sct.canada.ca/newpolicy');
  await assert.rejects(()=>captureOfficialSource({sourceId:'DIRECTIVE_ADM',url,destinationDirectory:dir,
   fetcher:async()=>new Response(null,{status:302,headers:{location:'https://private.example.org/'}})}),
   /approved federal government domain/);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('rejects oversized, empty, wrong-content-type and failed responses',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'aegis-archive-'));
 try{
  for(const fetcher of [
   async()=>new Response('abcdefghijk',{headers:{'content-type':'text/html'}}),
   async()=>new Response('',{headers:{'content-type':'text/html'}}),
   async()=>new Response('x',{headers:{'content-type':'application/octet-stream'}}),
   async()=>new Response('x',{status:404,headers:{'content-type':'text/html'}})]){
   await assert.rejects(()=>captureOfficialSource({sourceId:'DIRECTIVE_ADM',url,destinationDirectory:dir,fetcher,maxBytes:10}));
  }
 }finally{await rm(dir,{recursive:true,force:true})}
});