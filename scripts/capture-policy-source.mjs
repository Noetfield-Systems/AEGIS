#!/usr/bin/env node
/** Run in a controlled environment; never promote captured bytes to approved mappings. */
import {captureOfficialSource} from '../assurance/source-archive.mjs';
const options={};
for(let i=2;i<process.argv.length;i+=2){
 const key=process.argv[i];
 if(!['--id','--url','--out'].includes(key)||!process.argv[i+1]){
  console.error('Usage: node scripts/capture-policy-source.mjs --id DIRECTIVE_ADM --url https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592 --out /secure/archive');
  process.exit(2);
 }
 options[key]=process.argv[i+1];
}
if(!options['--id']||!options['--url']||!options['--out']){
 console.error('Missing --id, --url or --out');process.exit(2);
}
try{
 const result=await captureOfficialSource({
  sourceId:options['--id'],url:options['--url'],destinationDirectory:options['--out']
 });
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
}catch(error){console.error(error.message);process.exitCode=1}