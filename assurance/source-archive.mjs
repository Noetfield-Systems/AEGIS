/** Capture unmodified official-publication HTTP bytes. Not legal review or ISC evidence credit. */
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const MAX_BYTES=6000000;
const ID=/^[A-Z][A-Z0-9_]{1,63}$/;
export function officialUrl(raw){
 let u;try{u=new URL(raw)}catch{throw new TypeError('Invalid official source URL')}
 if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash)throw new TypeError('Official source must use HTTPS without credentials, port or fragment');
 const host=u.hostname.toLowerCase();
 if(!(host==='canada.ca'||host.endsWith('.canada.ca')||host==='tbs-sct.gc.ca'||host.endsWith('.tbs-sct.gc.ca')))
   throw new TypeError('Source host is not an approved federal government domain');
 return u;
}
async function boundedBytes(response,maxBytes){
 const length=response.headers.get('content-length');
 if(length!==null && Number(length)>maxBytes)throw new RangeError('Official source exceeds size limit');
 if(!response.body?.getReader)throw new TypeError('Missing response body');
 const reader=response.body.getReader(),chunks=[];let total=0;
 try{
   for(;;){
     const {done,value}=await reader.read();if(done)break;
     total+=value.byteLength;
     if(total>maxBytes)throw new RangeError('Official source exceeds size limit');
     chunks.push(Buffer.from(value));
   }
 }finally{reader.releaseLock()}
 return Buffer.concat(chunks,total);
}
export async function captureOfficialSource({sourceId,url,destinationDirectory,fetcher=fetch,retrievedAt=new Date().toISOString(),maxBytes=MAX_BYTES}){
 if(!ID.test(sourceId??''))throw new TypeError('Invalid sourceId');
 if(typeof destinationDirectory!=='string'||!destinationDirectory.trim())throw new TypeError('destinationDirectory required');
 if(!Number.isFinite(Date.parse(retrievedAt)))throw new TypeError('Invalid retrieval timestamp');
 if(!Number.isInteger(maxBytes)||maxBytes<1||maxBytes>MAX_BYTES)throw new RangeError('Invalid capture size limit');
 const requestedUrl=officialUrl(url).href;
 let current=requestedUrl,response;const redirectChain=[];
 for(let i=0;i<=4;i++){
   response=await fetcher(current,{redirect:'manual',headers:{Accept:'text/html,application/pdf'},signal:AbortSignal.timeout(15000)});
   if([301,302,303,307,308].includes(response.status)){
     if(i===4)throw new RangeError('Too many redirects');
     const loc=response.headers.get('location');if(!loc)throw new TypeError('Redirect missing Location');
     const next=officialUrl(new URL(loc,current).href).href;
     redirectChain.push({from:current,to:next,status:response.status});current=next;continue;
   }
   break;
 }
 if(response.status!==200)throw new Error('Official source returned HTTP '+response.status);
 const contentType=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
 if(!['text/html','application/xhtml+xml','application/pdf'].includes(contentType))throw new TypeError('Unsupported response content type');
 const bytes=await boundedBytes(response,maxBytes);
 if(!bytes.length)throw new TypeError('Empty official source');
 const digest=createHash('sha256').update(bytes).digest('hex');
 const base=sourceId+'-'+digest.slice(0,16);
 const snapshotFilename=base+(contentType==='application/pdf'?'.pdf':'.html');
 const manifestFilename=base+'.manifest.json';
 const manifest={
   schemaVersion:'1.0',sourceId,requestedUrl,finalUrl:current,redirectChain,contentType,
   retrievedAt,byteLength:bytes.length,sha256:'sha256:'+digest,
   snapshotFilename,manifestFilename,captureStatus:'ORIGINAL_BYTES_CAPTURED_UNREVIEWED',
   sourceEffectiveVersion:null,expertMappingApproved:false,applicability:'UNDETERMINED',
   iscEvidenceCredited:false,
   limitations:['HTTP byte capture is not a verified effective policy version or legal determination.',
     'Independent expert review of applicable clauses and control mapping remains required.']
 };
 await mkdir(destinationDirectory,{recursive:true,mode:0o700});
 const snapshotPath=path.join(destinationDirectory,snapshotFilename);
 try{await writeFile(snapshotPath,bytes,{flag:'wx',mode:0o600})}
 catch(e){
   if(e.code!=='EEXIST')throw e;
   if(!(await readFile(snapshotPath)).equals(bytes))throw new Error('Snapshot collision with different bytes');
 }
 await writeFile(path.join(destinationDirectory,manifestFilename),JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
 return manifest;
}