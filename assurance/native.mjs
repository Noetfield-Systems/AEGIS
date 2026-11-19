/**
 * AEGIS experimental native evaluation kernel.
 * Measurements are deterministic and scoped to provided input. Never treat as a government
 * acceptance, safety certification, audit or ISC evidence automatically.
 */
import {createHash} from 'node:crypto';
import {replayCompleted} from './replay.mjs';
const maxRows=500;
const fail=(msg)=>{throw new TypeError(msg)};
const obj=(x,label)=>{if(!x||typeof x!=='object'||Array.isArray(x))fail(label+' must be an object');return x};
const rows=(x,label)=>{if(!Array.isArray(x)||x.length>maxRows)fail(label+' must be an array of at most '+maxRows+' records');return x};
const finite=(n)=>typeof n==='number'&&Number.isFinite(n);
const ratio=(num,den)=>den===0?null:Number((num/den).toFixed(6));
const hash=(x)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const envelope=(kind,input,metrics,limitations)=>({kind,experimental:true,iscEvidenceCredited:false,generatedAt:null,methodVersion:'native-metrics-v0.1.0',inputHash:'sha256:'+hash(input),metrics,limitations});

export function evaluateData(input){
 obj(input,'data input');const records=rows(input.records,'records');
 const schema=obj(input.schema,'schema');const fields=Object.keys(schema);
 if(fields.length===0||fields.length>40)fail('schema must specify 1–40 fields');
 if(fields.some(f=>!['number','string','boolean'].includes(schema[f])))fail('schema types must be number, string or boolean');
 const counts={};for(const f of fields)counts[f]={missing:0,typeErrors:0};
 let duplicates=0;const seen=new Set();
 for(const row of records){
  obj(row,'record');const key=JSON.stringify(row);
  if(seen.has(key))duplicates++;else seen.add(key);
  for(const [f,t] of Object.entries(schema)){
   const v=row[f];
   if(v===null||v===undefined||v===''){counts[f].missing++;continue}
   if(typeof v!==t||(t==='number'&&!finite(v)))counts[f].typeErrors++;
  }
 }
 const fieldMetrics=Object.fromEntries(fields.map(f=>[f,{...counts[f],missingRate:ratio(counts[f].missing,records.length),typeErrorRate:ratio(counts[f].typeErrors,records.length)}]));
 return envelope('data',input,{records:records.length,duplicateCount:duplicates,duplicateRate:ratio(duplicates,records.length),fields:fieldMetrics},['Schema and duplicate checks only; does not establish data validity, representativeness, fairness, drift, privacy or regulatory compliance.','Empty data produces null rates, not false certainty.']);
}
export function evaluateClassifier(input){
 obj(input,'classifier input');
 const labels=rows(input.labels,'labels');const predicted=rows(input.predictions,'predictions');
 if(labels.length!==predicted.length)fail('labels and predictions must have same length');
 if([...labels,...predicted].some(x=>x!==0&&x!==1))fail('labels and predictions must be binary 0 or 1');
 let tp=0,tn=0,fp=0,fn=0;
 for(let i=0;i<labels.length;i++){
  if(labels[i]===1&&predicted[i]===1)tp++;
  else if(labels[i]===0&&predicted[i]===0)tn++;
  else if(labels[i]===0)fp++;
  else fn++;
 }
 const n=labels.length;
 const precision=ratio(tp,tp+fp),recall=ratio(tp,tp+fn);
 const f1=precision===null||recall===null||precision+recall===0?null:Number((2*precision*recall/(precision+recall)).toFixed(6));
 return envelope('classifier',input,{n,tp,tn,fp,fn,accuracy:ratio(tp+tn,n),precision,recall,f1,positiveSupport:tp+fn,negativeSupport:tn+fp},['Binary classification only; ground-truth quality, deployment representativeness, uncertainty and model fairness have not been established.','Undefined precision/recall/F1 are null; no automatic pass or safety claim.']);
}
export function evaluateOutputs(input){
 obj(input,'output input');
 const outputs=rows(input.outputs,'outputs');
 if(outputs.some(x=>typeof x!=='string'||x.length>5000))fail('outputs must be strings up to 5000 characters');
 const required=rows(input.requiredPhrases||[],'requiredPhrases'),forbidden=rows(input.forbiddenPhrases||[],'forbiddenPhrases');
 if([...required,...forbidden].some(x=>typeof x!=='string'||!x.trim()||x.length>150))fail('phrases must be nonempty strings of at most 150 characters');
 const findings=outputs.map((txt,index)=>{
  const low=txt.toLocaleLowerCase();const missing=required.filter(s=>!low.includes(s.toLocaleLowerCase()));
  const found=forbidden.filter(s=>low.includes(s.toLocaleLowerCase()));
  return {index,requiredPhraseFailures:missing,forbiddenPhraseMatches:found,passedRuleChecks:missing.length===0&&found.length===0};
 });
 const passes=findings.filter(x=>x.passedRuleChecks).length;
 return envelope('output',input,{n:outputs.length,passCount:passes,passRate:ratio(passes,outputs.length),findings},['This is a deterministic phrase-rule check only: it is not a semantic hallucination, accuracy, bias, safety or harmful-content evaluator.','Use expert-labelled tasks and independent native evaluation suites before asserting E6 readiness.']);
}
export function replayPolicy(input){
 obj(input,'replay input');
 const before=obj(input.before,'before policy'),after=obj(input.after,'after policy');
 const previous=obj(before.controls,'before controls'),current=obj(after.controls,'after controls');
 const changed=[...new Set([...Object.keys(previous),...Object.keys(current)])].filter(k=>JSON.stringify(previous[k])!==JSON.stringify(current[k])).sort();
 const systems=rows(input.systems,'systems'),assessments=rows(input.assessments,'assessments');
 const ids=new Set();const impacted=[];
 for(const s of systems){
  obj(s,'system');if(typeof s.id!=='string'||!s.id||ids.has(s.id))fail('unique system id required');ids.add(s.id);
  if(!Array.isArray(s.controlIds)||s.controlIds.some(x=>typeof x!=='string'))fail('system controlIds required');
  const intersection=s.controlIds.filter(c=>changed.includes(c));
  if(intersection.length)impacted.push({systemId:s.id,changedControls:[...new Set(intersection)].sort()});
 }
 for(const a of assessments){obj(a,'assessment');if(!ids.has(a.systemId))fail('assessment references unknown system');}
 const affected=new Set(impacted.map(x=>x.systemId));
 const replays=assessments.filter(a=>affected.has(a.systemId)).map(a=>({
  assessmentId:String(a.id||''),systemId:a.systemId,originalFinding:a.finding??null,originalStatus:a.status??null,
  replayFinding:'UNABLE_TO_DETERMINE',reviewRequired:true,
  reason:'Policy control changed; native reevaluation and human review not executed.'
 }));
 return envelope('replay',input,{changedControls:changed,impactedSystems:impacted,unaffectedSystems:systems.filter(s=>!affected.has(s.id)).map(s=>s.id),assessmentsNeedingReview:replays},['A deterministic impact-planning and replay-invalidation fixture, not a native reevaluation of the data/model/output or a verified policy graph.','Original findings are retained; no changed result is marked MET until new tests and accountable human review.']);
}
export function runNative(input){
 obj(input,'evaluation request');
 const mode=String(input.mode||'');const payload=obj(input.input,'evaluation input');
 if(mode==='data')return evaluateData(payload);
 if(mode==='classifier')return evaluateClassifier(payload);
 if(mode==='output')return evaluateOutputs(payload);
 if(mode==='replay')return replayPolicy(payload);
 if(mode==='golden-replay')return replayCompleted(payload,{data:evaluateData,classifier:evaluateClassifier,output:evaluateOutputs});
 fail('mode must be data, classifier, output, replay or golden-replay');
}
