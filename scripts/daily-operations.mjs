import { readFile,appendFile } from 'node:fs/promises';
const backlog=JSON.parse(await readFile(new URL('../ops/backlog.json',import.meta.url),'utf8'));
const repo=process.env.GITHUB_REPOSITORY||'Noetfield-Systems/AEGIS';
const token=process.env.GITHUB_TOKEN;
const report={date:new Date().toISOString(),venture:'AEGIS',repo,health:'UNKNOWN',selected:null,issue:null,sinaOS:'NOT_CONFIGURED',note:'Daily queue dispatch, not an autonomous code/merge receipt.'};
const api='https://api.github.com/repos/'+repo;
const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:'Bearer '+token};
try{
 const c=new AbortController();const t=setTimeout(()=>c.abort(),8000);
 const r=await fetch(process.env.AEGIS_HEALTH_URL||'https://aegis-isc-web-production.up.railway.app/api/health',{signal:c.signal});clearTimeout(t);
 const data=await r.json().catch(()=>({}));
 report.health=r.ok&&data.ok===true?'HEALTHY':'UNHEALTHY '+r.status;
}catch(e){report.health='UNAVAILABLE: '+e.message}
if(token){
 try{
  const r=await fetch(api+'/issues?state=all&per_page=100',{headers});
  if(!r.ok)throw Error('issues.list HTTP '+r.status);
  const issues=(await r.json()).filter(x=>!x.pull_request);
  const sorted=[...backlog.items].sort((a,b)=>a.priority-b.priority);
  const next=sorted.find(x=>!issues.some(i=>String(i.title).includes('['+x.id+']')));
  if(next){
   report.selected=next.id;
   const body=['## Daily AEGIS Company OS WorkPacket','- Venture: AEGIS','- Source: ops/backlog.json','- Priority: P'+next.priority,'- Owner role: '+next.team,'- Goal: '+next.title,'','### Acceptance criteria',...next.acceptance.map(x=>'- [ ] '+x),'','### Actual execution proof (required to close)','- [ ] Branch/PR and commit SHA','- [ ] CI URL and actual tests','- [ ] Independent reviewer receipt','- [ ] Production deployment ID & health check','- [ ] Next action, owner and due date','','This is a work item only, not proof that a coding agent executed it.'].join('\n');
   const created=await fetch(api+'/issues',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({title:'['+next.id+'] '+next.title,body})});
   if(!created.ok)throw Error('issues.create HTTP '+created.status);
   report.issue=(await created.json()).html_url;
  }else report.selected='ALL_BACKLOG_ITEMS_HAVE_ISSUES';
 }catch(e){report.issue='ERROR: '+e.message}
}else report.issue='MISSING_GITHUB_TOKEN';
const url=process.env.SINA_OS_DISPATCH_URL,secret=process.env.SINA_OS_TOKEN;
if(url&&secret){
 try{
  if(new URL(url).protocol!=='https:')throw Error('HTTPS endpoint required');
  const resp=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify({schema:'aegis-workpacket-v1',venture_id:'aegis',objective:report.selected,source_issue_url:report.issue,health:report.health,created_at:report.date})});
  report.sinaOS=resp.ok?'DELIVERED_HTTP_'+resp.status:'REJECTED_HTTP_'+resp.status;
 }catch(e){report.sinaOS='ERROR: '+e.message}
}
console.log(JSON.stringify(report,null,2));
if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,'## AEGIS Daily Operations\n\n```json\n'+JSON.stringify(report,null,2)+'\n```\n');
if(report.health!=='HEALTHY')process.exitCode=1;
