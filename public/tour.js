/* AEGIS public simulation: EN/FR only; no user input, secrets, storage, or private workspace calls. */
(() => {
'use strict';
const strings={
 en:{
  skip:'Skip to demonstration',workflow:'Workflow',outcomes:'Results',workspace:'Private workspace',
  eyebrow:'INTERACTIVE ASSURANCE WALKTHROUGH · SYNTHETIC',
  hero:'Trace every decision.\nReassess when the rules change.',
  intro:'Explore how AEGIS identifies policy changes, traces affected AI systems, reruns native evaluation and routes findings for human review.',
  explore:'Explore demonstration',method:'Method and limitations',
  disclaimer:'Public demonstration: fictional policy clauses, synthetic AI systems and test-only evidence. Not an official compliance finding, independent review or TRL certification.',
  methodname:'THE ASSURANCE PROCESS',
  step1:'Register',step1d:'Versioned policy and AI systems',step2:'Detect change',step2d:'Affected and unaffected systems',step3:'Rerun native tests',step3d:'Measured findings before and after',step4:'Review and trace',step4d:'Preserved originals and human oversight',
  real:'LIVE FIRST-PARTY COMPUTATION · FIXED TEST INPUT',testtitle:'An auditable change scenario',testdesc:'This view retrieves a server-computed result from the same native evaluation engine used by the private laboratory. It is read-only and never touches customer or application evidence.',synthetic:'SYNTHETIC ONLY',loading:'Loading a reproducible synthetic run…',
  clause:'Changed policy clauses',systems:'Affected AI systems',replays:'Completed assessments replayed',findings:'Technical findings changed',
  policy:'01 / POLICY IMPACT',impact:'A change with traceable scope',impacttext:'The compiler isolates affected controls. Unchanged systems are recorded separately rather than silently omitted.',
  previous:'Previous version',newversion:'New version',affected:'Affected',unaffected:'Unaffected',
  replaytitle:'02 / HISTORICAL REASSESSMENT',compare:'Before and after, not a static score',comparetext:'Original recorded findings are retained. The native evaluator reruns the same bound inputs against changed thresholds.',
  control:'Control',was:'Originally',now:'Recomputed',metric:'Measured value',
  lifecycle:'03 / ASSESSMENT LIFECYCLE',allstages:'One policy change, three work states',lifecycletext:'Completed assessments are recomputed. In-progress and scheduled work receive a reassessment plan, not a fabricated result.',
  provenance:'04 / EVIDENCE & REVIEW',governance:'Explainability without false certainty',governancetext:'A deterministic receipt binds the synthetic result. No government decision or independently validated reviewer is implied.',
  receipt:'SHA-256 calculation receipt',reviewstatus:'Regulatory status',undetermined:'UNABLE TO DETERMINE',
  transparency:'EVIDENCE STANDARD',whatmeans:'What this demonstration does—and does not—prove',demonstrates:'Demonstrated in this test',demonstratesbody:'Deterministic policy impact detection on fictional clauses, first-party native metric replay, original assessment preservation and a reproducible calculation receipt.',
  notverified:'Not independently verified',notverifiedbody:'Real Canadian regulatory applicability, a reviewed government policy-control mapping, multi-tenant authorization, a representative TRL 5 study or an external benchmark.',
  sourcecode:'Technical methodology and source:',footer:'An AI decision assurance research product by Noetfield Systems Inc.',
  lineageEyebrow:'AEGIS / TRACEABLE DECISIONS',lineageTitle:'From rule change to evidence receipt.',lineageDesc:'Select a stage to inspect its measured technical result. All counts come from the native engine.',lineageScope:'SYNTHETIC MEASUREMENT',lineageHint:'Select a stage to inspect a measured result.',tracePolicy:'POLICY VERSION',traceControls:'CONTROL CHANGES',traceSystems:'AI SYSTEMS',traceReplay:'NATIVE REPLAY',traceFindings:'CHANGED FINDINGS',traceReceipt:'RESULT HASH',detailPolicy:'This synthetic version is the source of subsequent evaluation.',detailControls:'Mapped controls have changed synthetic clauses.',detailSystems:'Affected and unaffected systems are preserved.',detailReplay:'Completed assessments have been recomputed; future tasks are only planned.',detailFindings:'Changed native findings are not regulatory compliance findings.',detailReceipt:'Content hash binds the synthetic result; human review remains pending.',
  completed:'Completed · native replay',active:'In progress · reassessment plan',planned:'Planned · future version selection',
  none:'None',error:'The synthetic demonstration is temporarily unavailable.',updated:'Recomputed',preserved:'Original preserved',reviewPending:'Human review pending',
  MET:'MET',NOT_MET:'NOT MET',PARTIALLY_MET:'PARTIALLY MET',UNABLE_TO_DETERMINE:'UNABLE TO DETERMINE',NOT_APPLICABLE:'NOT APPLICABLE'
 },
 fr:{
  skip:'Aller à la démonstration',workflow:'Parcours',outcomes:'Résultats',workspace:'Espace privé',
  eyebrow:'PARCOURS INTERACTIF D’ASSURANCE · SIMULATION',
  hero:'Retracez chaque décision.\nRéévaluez lorsque les règles changent.',
  intro:'Découvrez comment AEGIS repère les changements de politiques, identifie les systèmes d’IA touchés, réexécute les évaluations natives et soumet les résultats à un examen humain.',
  explore:'Explorer la démonstration',method:'Méthode et limites',
  disclaimer:'Démonstration publique : clauses fictives, systèmes d’IA simulés et preuves de test uniquement. Aucun constat officiel de conformité, examen indépendant ni certification du NMT.',
  methodname:'LE PROCESSUS D’ASSURANCE',
  step1:'Enregistrer',step1d:'Politiques et systèmes d’IA versionnés',step2:'Repérer le changement',step2d:'Systèmes touchés et non touchés',step3:'Réexécuter les tests natifs',step3d:'Mesures avant et après',step4:'Réviser et retracer',step4d:'Résultats originaux conservés et supervision humaine',
  real:'CALCUL NATIF EN DIRECT · DONNÉES DE TEST FIXES',testtitle:'Un scénario de changement vérifiable',testdesc:'Cette vue récupère un résultat calculé sur le serveur par le même moteur natif que celui du laboratoire privé. Elle est en lecture seule et n’accède jamais aux données des clients ni aux preuves de candidature.',synthetic:'SIMULATION UNIQUEMENT',loading:'Chargement d’une simulation reproductible…',
  clause:'Clauses de politique modifiées',systems:'Systèmes d’IA touchés',replays:'Évaluations terminées réexécutées',findings:'Résultats techniques modifiés',
  policy:'01 / IMPACT DES POLITIQUES',impact:'Un changement dont la portée est traçable',impacttext:'Le compilateur isole les contrôles touchés. Les systèmes inchangés sont explicitement consignés.',
  previous:'Version précédente',newversion:'Nouvelle version',affected:'Touchés',unaffected:'Non touchés',
  replaytitle:'02 / RÉÉVALUATION HISTORIQUE',compare:'Avant et après, pas un score statique',comparetext:'Les conclusions initiales sont conservées. L’évaluateur natif réexécute les mêmes données liées aux nouvelles limites.',
  control:'Contrôle',was:'Initialement',now:'Recalculé',metric:'Valeur mesurée',
  lifecycle:'03 / CYCLE DE VIE',allstages:'Un changement, trois états de travail',lifecycletext:'Les évaluations terminées sont recalculées. Les travaux en cours et planifiés reçoivent un plan de réévaluation, sans résultat inventé.',
  provenance:'04 / PREUVES ET RÉVISION',governance:'Des explications sans fausse certitude',governancetext:'Une empreinte reproductible lie le résultat simulé. Aucune décision gouvernementale ni validation indépendante du réviseur n’est sous-entendue.',
  receipt:'Empreinte SHA-256 du calcul',reviewstatus:'État réglementaire',undetermined:'IMPOSSIBLE À DÉTERMINER',
  transparency:'NORME DE PREUVE',whatmeans:'Ce que la démonstration prouve — et ne prouve pas',demonstrates:'Démontré par ce test',demonstratesbody:'Détection déterministe sur des clauses fictives, réexécution de mesures natives, conservation des évaluations originales et empreinte reproductible.',
  notverified:'Non vérifié de façon indépendante',notverifiedbody:'Applicabilité des exigences canadiennes réelles, correspondances réglementaires approuvées, accès multiorganisationnel, étude représentative de NMT 5 ou comparaison externe.',
  sourcecode:'Méthode technique et code source :',footer:'Produit de recherche en assurance des décisions d’IA de Noetfield Systems Inc.',
  lineageEyebrow:'AEGIS / DÉCISIONS TRAÇABLES',lineageTitle:'Du changement de règle au reçu de preuve.',lineageDesc:'Sélectionnez une étape pour examiner son résultat technique. Les chiffres viennent du moteur natif.',lineageScope:'MESURE FICTIVE',lineageHint:'Sélectionnez une étape pour examiner les résultats.',tracePolicy:'VERSION DE POLITIQUE',traceControls:'CONTRÔLES MODIFIÉS',traceSystems:'SYSTÈMES D’IA',traceReplay:'RÉÉVALUATION NATIVE',traceFindings:'CONSTATS MODIFIÉS',traceReceipt:'EMPREINTE DU RÉSULTAT',detailPolicy:'Cette version fictive est la source des évaluations.',detailControls:'Les contrôles liés aux clauses fictives sont modifiés.',detailSystems:'Les systèmes touchés et non touchés sont conservés.',detailReplay:'Les évaluations terminées sont recalculées; le travail futur reste planifié.',detailFindings:'Les constats natifs modifiés ne sont pas des décisions de conformité.',detailReceipt:'L’empreinte lie le résultat fictif; la révision humaine reste en attente.',
  completed:'Terminé · réexécution native',active:'En cours · plan de réévaluation',planned:'Planifié · choix de version future',
  none:'Aucun',error:'La démonstration simulée est temporairement indisponible.',updated:'Recalculé',preserved:'Original conservé',reviewPending:'Révision humaine en attente',
  MET:'SATISFAIT',NOT_MET:'NON SATISFAIT',PARTIALLY_MET:'PARTIELLEMENT SATISFAIT',UNABLE_TO_DETERMINE:'IMPOSSIBLE À DÉTERMINER',NOT_APPLICABLE:'NON APPLICABLE'
 }
};
const byId=id=>document.getElementById(id);
let language='en',result=null;
function translate(){
 const t=strings[language];document.documentElement.lang=language==='fr'?'fr-CA':'en-CA';
 document.documentElement.dir='ltr';
 document.querySelectorAll('[data-i18n]').forEach(el=>{
  const key=el.dataset.i18n;if(!Object.hasOwn(t,key))return;
  if(key==='hero'){el.textContent='';const lines=t[key].split('\n');lines.forEach((line,i)=>{if(i)el.append(document.createElement('br'));el.append(document.createTextNode(line))});}
  else el.textContent=t[key];
 });
 byId('locale').textContent=language==='en'?'EN / FR':'FR / EN';
 byId('locale').setAttribute('aria-label',language==='en'?'Switch to French':'Passer en anglais');
 document.title=language==='en'?'AEGIS — Decision Assurance Demonstration':'AEGIS — Démonstration d’assurance décisionnelle';
 if(result)render(result);
}
const appendChip=(node,label)=>{const e=document.createElement('span');e.textContent=label;node.appendChild(e)};
const appendCell=(row,value,clazz='')=>{const cell=document.createElement('td');cell.textContent=value??'—';if(clazz)cell.className=clazz;row.appendChild(cell)};
function renderTrace(data){
 const root=byId('tour-lineage-nodes'),t=strings[language],s=data.summary;root.replaceChildren();
 const items=[
 ['tracePolicy',data.sourceVersions.after,'detailPolicy',0],
 ['traceControls',s.changedControls,'detailControls',0],
 ['traceSystems',s.affectedSystems,'detailSystems',0],
 ['traceReplay',s.historicalAssessmentsReexecuted,'detailReplay',1],
 ['traceFindings',s.changedTechnicalFindings,'detailFindings',1],
 ['traceReceipt',data.receiptHash.slice(0,18)+'…','detailReceipt',3]];
 items.forEach(([label,val,detail,card],i)=>{
  const b=document.createElement('button');b.type='button';b.className='trace-card';b.dataset.card=String(card);b.dataset.detail=detail;
  b.setAttribute('aria-label',t[label]+': '+val+'. '+t[detail]);
  const n=document.createElement('span');n.className='trace-number';n.textContent=String(i+1).padStart(2,'0');
  const l=document.createElement('small');l.textContent=t[label];
  const v=document.createElement('strong');v.textContent=val;b.append(n,l,v);root.append(b);
 });
}
function render(data){
 const t=strings[language],s=data.summary;
 renderTrace(data);
 for(const [id,value] of [['stat-clauses',s.changedClauses],['stat-systems',s.affectedSystems],['stat-replays',s.historicalAssessmentsReexecuted],['stat-findings',s.changedTechnicalFindings]])byId(id).textContent=String(value);
 byId('before-version').textContent=data.sourceVersions.before;
 byId('after-version').textContent=data.sourceVersions.after;
 const affected=byId('affected'),unaffected=byId('unaffected');affected.replaceChildren();unaffected.replaceChildren();
 data.affectedSystemIds.forEach(x=>appendChip(affected,x));
 data.unaffectedSystemIds.forEach(x=>appendChip(unaffected,x));
 if(!data.unaffectedSystemIds.length)appendChip(unaffected,t.none);
 const body=byId('findings-rows');body.replaceChildren();
 for(const f of data.findingsTrace){
  const tr=document.createElement('tr');appendCell(tr,f.controlId);
  appendCell(tr,t[f.observedPrevious]??f.observedPrevious,'good');
  appendCell(tr,t[f.recomputedCurrent]??f.recomputedCurrent,'bad');
  appendCell(tr,f.metricValue===null?'—':String(f.metricValue));body.appendChild(tr);
 }
 const queue=byId('work-rows');queue.replaceChildren();
 const phaseNames={COMPLETED:t.completed,IN_PROGRESS:t.active,PLANNED:t.planned};
 for(const w of data.reassessmentQueue){
  const row=document.createElement('div');const label=document.createElement('strong'),desc=document.createElement('span');
  label.textContent=phaseNames[w.phase]??w.phase;desc.textContent=w.workItemId;
  row.append(label,desc);queue.appendChild(row);
 }
 byId('receipt').textContent=data.receiptHash;
}
async function load(){
 try{
  const res=await fetch('/api/public/demo',{credentials:'omit',headers:{Accept:'application/json'}});
  if(!res.ok)throw Error('Failed to load public synthetic data');
  const payload=await res.json();
  if(payload.synthetic!==true||payload.evidenceCredited!==false||!payload.result||payload.result.kind!=='integrated-ai-assurance-simulation')throw Error('Public contract mismatch');
  result=payload.result;render(result);byId('demo-content').hidden=false;byId('demo-loading').hidden=true;
 }catch{
  byId('demo-error').textContent=strings[language].error;byId('demo-error').hidden=false;byId('demo-loading').hidden=true;
 }
}
byId('tour-lineage-nodes').addEventListener('click',event=>{
 const b=event.target.closest('[data-card]');if(!b)return;
 byId('tour-lineage-detail').textContent=strings[language][b.dataset.detail];
 const cards=document.querySelectorAll('#demo-content .grid .panel'),selected=cards[Number(b.dataset.card)];
 if(selected){cards.forEach(p=>p.classList.remove('tour-selected'));selected.classList.add('tour-selected');selected.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});}
});
byId('locale').addEventListener('click',()=>{language=language==='en'?'fr':'en';translate()});
translate();load();
})();
