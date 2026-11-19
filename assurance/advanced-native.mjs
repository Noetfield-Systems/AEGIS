/**
 * AEGIS native E6 extensions. Deterministic, independently reproducible measurements
 * on caller-supplied bounded numeric and ground-truth fixtures. No model inference,
 * policy certification, semantic entailment or automatic ISC credit.
 */
import {contentHash} from './replay.mjs';
const fail=s=>{throw new TypeError(s)};
const obj=(v,l)=>{if(!v||typeof v!=='object'||Array.isArray(v))fail(l+' must be an object');return v};
const id=(s,l)=>{if(typeof s!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,79}$/.test(s))fail(l+' is required');return s};
const bounded=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1;
const rate=(n,d)=>d?Number((n/d).toFixed(6)):null;
function vector(v,name,max=2000){
 if(!Array.isArray(v)||v.length>max||v.some(x=>!bounded(x)))fail(name+' must contain 0–'+max+' bounded [0,1] numeric values');
 return v;
}
function meta(input,kind,measure,value,details,limitations,threshold=null){
 id(input.datasetVersion,'datasetVersion');id(input.modelVersion,'modelVersion');
 const h=contentHash(input);
 return {
  kind,evaluationId:contentHash({kind,version:'advanced-native-v0.1.0',inputHash:h}),
  evaluatorVersion:'advanced-native-v0.1.0',inputHash:h,
  datasetVersion:input.datasetVersion,modelVersion:input.modelVersion,
  metricDefinition:measure,measuredValue:value,threshold,
  technicalThresholdSatisfied:threshold===null||value===null?null:value<=threshold,
  generatedEvidenceRef:'urn:aegis:native:'+h.slice(7),
  metrics:details,limitations,
  experimental:true,independentlyValidated:false,iscEvidenceCredited:false,
  complianceFinding:'UNABLE_TO_DETERMINE'
 };
}
export function evaluateDistributionShift(input){
 obj(input,'shift input');
 const baseline=vector(input.baseline,'baseline'),current=vector(input.current,'current');
 const bins=input.bins??5;
 if(!Number.isInteger(bins)||bins<2||bins>20)fail('bins must be integer 2–20');
 const threshold=input.psiThreshold??null;
 if(threshold!==null&&(!Number.isFinite(threshold)||threshold<0||threshold>10))fail('psiThreshold must be a nonnegative bounded number');
 const bucket=values=>{
  const counts=Array(bins).fill(0);
  for(const v of values)counts[Math.min(bins-1,Math.floor(v*bins))]++;
  return counts;
 };
 const past=bucket(baseline),next=bucket(current);
 let psi=null,shiftMean=null;
 if(baseline.length&&current.length){
  // Additive smoothing avoids log(0); results depend on binning and sample size.
  const alpha=0.5;
  psi=0;
  for(let i=0;i<bins;i++){
   const p=(past[i]+alpha)/(baseline.length+alpha*bins);
   const q=(next[i]+alpha)/(current.length+alpha*bins);
   psi+=(q-p)*Math.log(q/p);
  }
  psi=Number(psi.toFixed(6));
  shiftMean=Number((current.reduce((a,b)=>a+b,0)/current.length-baseline.reduce((a,b)=>a+b,0)/baseline.length).toFixed(6));
 }
 return meta(input,'distribution-shift','Population Stability Index (fixed-width bins with Laplace 0.5 smoothing)',psi,{
  baselineCount:baseline.length,currentCount:current.length,bins,
  baselineHistogram:past,currentHistogram:next,meanDelta:shiftMean,psi
 },[
  'PSI is a univariate distribution signal only; it does not establish data quality, causality, fairness or model drift.',
  'Binning, sample sizes, data context and feature ranges must be validated by a domain specialist.'
 ],threshold);
}
export function evaluateCalibration(input){
 obj(input,'calibration input');
 const prob=vector(input.probabilities,'probabilities'),labels=input.labels;
 if(!Array.isArray(labels)||labels.length!==prob.length||labels.length>2000||labels.some(x=>x!==0&&x!==1))fail('labels must match probabilities and be binary');
 const bins=input.bins??5;
 if(!Number.isInteger(bins)||bins<2||bins>20)fail('bins must be integer 2–20');
 const threshold=input.brierThreshold??null;
 if(threshold!==null&&!bounded(threshold))fail('brierThreshold must be in [0,1]');
 const groups=Array.from({length:bins},(_,i)=>({index:i,n:0,probabilitySum:0,positiveCount:0}));
 let brier=0;
 for(let i=0;i<prob.length;i++){
  const g=groups[Math.min(bins-1,Math.floor(prob[i]*bins))];
  g.n++;g.probabilitySum+=prob[i];g.positiveCount+=labels[i];
  brier+=(prob[i]-labels[i])**2;
 }
 const n=prob.length,score=n?Number((brier/n).toFixed(6)):null;
 let ece=n?0:null;
 const details=groups.map(g=>{
  const averageProbability=g.n?rate(g.probabilitySum,g.n):null;
  const observedFrequency=g.n?rate(g.positiveCount,g.n):null;
  if(g.n)ece+=g.n/n*Math.abs(averageProbability-observedFrequency);
  return {bin:g.index,n:g.n,averageProbability,observedFrequency};
 });
 if(ece!==null)ece=Number(ece.toFixed(6));
 return meta(input,'binary-calibration','Brier score: mean((probability - observed label)^2)',score,{
  samples:n,brierScore:score,expectedCalibrationError:ece,bins:details
 },[
  'Calibration depends on independently valid reference labels; none are independently authenticated by this evaluator.',
  'Fixed-bin ECE is sensitive to bin count and small samples; it does not establish fairness or decision safety.'
 ],threshold);
}
const norm=x=>x.trim().toLocaleLowerCase('en-CA').replace(/\s+/g,' ');
export function evaluateGroundedClaims(input){
 obj(input,'grounded-output input');
 if(!Array.isArray(input.cases)||input.cases.length>500||!input.cases.length)fail('cases must include 1–500 labelled cases');
 const ids=new Set();let supported=0,unsupported=0,abstentionCorrect=0,emptyReferences=0;
 const findings=[];
 for(const c of input.cases){
  obj(c,'case');id(c.id,'case.id');
  if(ids.has(c.id))fail('duplicate case id');ids.add(c.id);
  if(!Array.isArray(c.referenceFacts)||c.referenceFacts.length>60||!Array.isArray(c.outputClaims)||c.outputClaims.length>60)fail('facts and claims must be arrays <=60');
  if([...c.referenceFacts,...c.outputClaims].some(x=>typeof x!=='string'||!x.trim()||x.length>400))fail('facts and claims must be nonempty strings');
  if(typeof c.abstained!=='boolean')fail('abstained is required boolean');
  if(c.abstained&&c.outputClaims.length)fail('an abstention cannot simultaneously assert claims');
  const facts=new Set(c.referenceFacts.map(norm));
  const wasEmpty=facts.size===0;
  if(wasEmpty)emptyReferences++;
  if(c.abstained===wasEmpty)abstentionCorrect++;
  const matched=c.outputClaims.filter(x=>facts.has(norm(x))).length,missed=c.outputClaims.length-matched;
  supported+=matched;unsupported+=missed;
  findings.push({
   caseId:c.id,labelledReferenceCount:facts.size,outputClaimCount:c.outputClaims.length,
   supportedByExactReference:matched,unsupportedByExactReference:missed,
   abstained:c.abstained,abstentionExpectedWhenNoFacts:wasEmpty,
   appropriateAbstention:c.abstained===wasEmpty
  });
 }
 const precision=rate(supported,supported+unsupported);
 const threshold=input.maxUnsupportedRate??null;
 if(threshold!==null&&!bounded(threshold))fail('maxUnsupportedRate must be in [0,1]');
 const unsupportedRate=rate(unsupported,supported+unsupported);
 return meta(input,'grounded-claims','Unsupported exact-label claim rate under a controlled reference-fact set',unsupportedRate,{
  cases:input.cases.length,totalSupported:supported,totalUnsupported:unsupported,
  groundedExactClaimPrecision:precision,unsupportedExactClaimRate:unsupportedRate,
  emptyReferenceCases:emptyReferences,abstentionDecisionAccuracy:rate(abstentionCorrect,input.cases.length),
  caseResults:findings
 },[
  'Exact canonical fact matching in a limited labelled benchmark is not semantic entailment or a general hallucination detector.',
  'Reference facts must come from trustworthy datasets; this evaluator does not validate their truthfulness or provenance.',
  'Empty outputs leave claim precision undefined; avoid interpreting null as a safe or compliant outcome.'
 ],threshold);
}
