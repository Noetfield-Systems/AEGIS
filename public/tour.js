/* AEGIS assurance command center: public fixed synthetic scenario, no private access.
 * Data integrity: all measurements come from /api/public/demo; DOM uses textContent.
 * Bilingual EN/FR, keyboard controls, mobile navigation and honest research limitations.
 */
(() => {
'use strict';
const copy={
en:{
 skip:'Skip to platform',instance:'RESEARCH ENVIRONMENT',navGroup1:'PLATFORM',navGroup2:'ASSURANCE',
 navOverview:'Command center',navSystems:'AI systems',navPolicy:'Policy intelligence',
 navEvaluation:'Evaluation lab',navEvidence:'Evidence ledger',navReports:'Reports & exports',
 navMethod:'Methodology',operatorLabel:'ASSURANCE STATUS',operatorValue:'Technical demonstration',
 private:'Private workspace',environment:'SYNTHETIC ENVIRONMENT',openPrivate:'Open workspace',
 technical:'FIRST-PARTY REPRODUCIBLE EVALUATION',statusCaution:'TEST INPUT ONLY',refresh:'Refresh scenario',
 loading:'Connecting to the native assurance engine…',errorTitle:'Unable to load synthetic data',
 errorMessage:'The first-party public demonstration is temporarily unavailable.',retry:'Retry',
 overviewKicker:'ASSURANCE OVERVIEW',overviewRef:'RUN 001 / REPRODUCIBLE',
 overviewTitle:'Decision intelligence, made observable.',
 overviewIntro:'One policy revision. Every affected system, technical re-evaluation and evidence receipt — linked in a single command center.',
 inspectTrace:'Inspect decision graph',exportEvidence:'Export evidence',
 disclaimer:'This interactive environment uses synthetic policy and AI-system data. Technical measurements are not governmental findings or TRL certification.',
 readLimits:'Method & limits',changedClauses:'Policy clauses changed',sourceVersioned:'Versioned change',
 affectedSystems:'Affected AI systems',inventoryBound:'Tracked in inventory',
 nativeReplays:'Native assessments replayed',computed:'Computed by engine',
 changedFindings:'Technical findings changed',priorRetained:'Originals retained',
 impactOverline:'POLICY CHANGE INTELLIGENCE',impactTitle:'What changed, and where it lands',
 previousVersion:'PREVIOUS VERSION',currentVersion:'CURRENT TEST VERSION',affectedLabel:'Impacted systems',
 unaffectedLabel:'Unaffected systems',scopeBySystem:'IMPACT SCOPE BY SYSTEM',viewInventory:'View inventory',
 nativeOverline:'NATIVE EVALUATION / BEFORE vs AFTER',evaluationTitle:'Evidence, recomputed',
 controlsTested:'CONTROLS',metLabel:'Met after replay',notMetLabel:'Not met after replay',
 otherLabel:'Other / pending',changedControls:'CONTROL RESULTS',viewEvaluation:'View evaluation',
 chainOverline:'PROVENANCE GRAPH',chainTitle:'A verifiable chain of decisions',
 chainCaution:'Human review is not simulated as completed. Every number comes from the native technical output.',
 workQueueOverline:'REASSESSMENT QUEUE',workQueueTitle:'Next actions, with provenance',
 systemsKicker:'SYSTEM GOVERNANCE / INVENTORY',systemsTitle:'AI systems.',
 systemsIntro:'Inspect which synthetic systems are affected by the policy revision. No owner, vendor or deployment details are invented.',
 syntheticOnly:'SYNTHETIC DATASET',all:'All',affectedShort:'Affected',unaffectedShort:'Unaffected',
 columnSystem:'SYSTEM IDENTIFIER',columnScope:'POLICY SCOPE',columnTest:'TECHNICAL ASSESSMENT',
 columnAction:'DETAILS',sourceLimited:'Only fields present in the synthetic result are displayed.',
 selectedSystem:'SELECTED SYSTEM',systemAffected:'Included in policy impact.',
 systemUnaffected:'Not affected by this particular synthetic policy revision.',
 systemKnown:'Version-scoped impact',systemNoPerSys:'Per-system technical verdict',
 systemNoPerSysValue:'Not established from this public summary',systemReview:'Human reviewer',
 systemReviewValue:'Not independently verified',systemRecorded:'Evidence source',
 systemRecordedValue:'Native synthetic result',details:'Inspect',noSystem:'No matching systems',
 matchCount:'systems displayed',searchSystem:'Search system identifier…',
 policyKicker:'CHANGE CONTROL / VERSIONED POLICY',policyTitle:'Policy intelligence.',
 policyIntro:'A traceable comparison of technical source versions, mapped impact and affected systems. The actual federal policy text is not represented by this synthetic dataset.',
 versionTracked:'VERSION TRACKED',comparisonKicker:'POLICY VERSION COMPARISON',comparisonTitle:'Revision overview',
 baseline:'BASELINE',baselineDesc:'Original technical source version',revision:'REVISION',
 revised:'REVISED',revisedDesc:'Synthetic revised test version',changedControlsNumber:'Controls impacted',
 impactedInventory:'IMPACTED INVENTORY',unaffectedInventory:'UNCHANGED INVENTORY',
 policyBoundary:'No real federal clause text or government applicability is asserted. Open the authenticated Workbench for synthetic source-to-control mappings.',
 evaluationKicker:'MODEL EVALUATION / NATIVE REPLAY',evaluationPageTitle:'Evaluation lab.',
 evaluationIntro:'Compare historical and recomputed technical findings with measured values, not merely a static compliance percentage.',
 nativeMeasured:'SERVER-COMPUTED',metricsKicker:'VERSION-BOUND TECHNICAL FINDINGS',
 findingsTitle:'Historical vs recomputed',resultNotLaw:'NOT A LEGAL DETERMINATION',
 control:'CONTROL',original:'HISTORICAL',recomputed:'RECOMPUTED',measured:'MEASURED VALUE',
 change:'CHANGE',originalPreserved:'Historical results are preserved; only current technical findings are recomputed.',
 evaluationMethod:'REPLAY METHOD',methodDeterministic:'Deterministic, receipt-linked.',
 methodNativeDescription:'This public view reads a bounded result calculated by AEGIS at service startup. Run new or alternative experiments in the authenticated Workbench.',
 openEvaluation:'Open private evaluation',statusResult:'REGULATORY DETERMINATION',
 statusExplanation:'A technical finding cannot establish the applicability or fulfillment of federal law without a validated policy mapping and qualified review.',
 evidenceKicker:'PROVENANCE / DECISION HISTORY',evidenceTitle:'Evidence ledger.',
 evidenceIntro:'Follow the sequence from a revised source to native results and a deterministic content receipt. Select any stage to inspect what is actually known.',
 receiptLinked:'SHA-256 LINKED',graphKicker:'DECISION PROVENANCE',
 graphTitle:'One change. Full technical lineage.',lineageHint:'Select a node to inspect its technical provenance.',
 queueKicker:'REASSESSMENT ACTION LOG',queueTitle:'Work states are not approvals.',
 receiptKicker:'DETERMINISTIC CONTENT RECEIPT',receiptTitle:'Reproducible, not certified.',
 hashLabel:'RESULT HASH',copyReceipt:'Copy result hash',copied:'Copied',
 humanPending:'Independent human review has not been performed for this synthetic public scenario.',
 reportsKicker:'AUDIT OUTPUT / REPRODUCIBILITY',reportsTitle:'Reports & exports.',
 reportsIntro:'Export the exact synthetic measurement shown in this environment. Private source evidence and organization records are never included.',
 safeExport:'PUBLIC DATA ONLY',reportPaperTag:'ASSURANCE RESEARCH / SYNTHETIC',
 reportPaperTitle:'Policy impact & native replay',
 reportPaperIntro:'A transparent engineering record, not an independently validated regulatory assessment.',
 reportSource:'SOURCE VERSION',reportChanges:'CHANGED FINDINGS',reportOutcome:'LEGAL OUTCOME',
 undetermined:'UNABLE TO DETERMINE',reportFoot:'SYNTHETIC TECHNICAL EVIDENCE · NOT CERTIFIED',
 exportOptions:'EXPORT OPTIONS',exportTitle:'Evidence you can inspect.',
 exportDescription:'The downloadable JSON contains the public synthetic measurement, version comparison, evaluation findings and SHA-256 receipt. It excludes all authenticated records.',
 downloadJson:'Download technical JSON receipt',detailedPrivate:'Open bilingual private report studio',
 reportCaution:'This is an experimental test record, not an official AI impact assessment or TRL certificate.',
 methodKicker:'METHODS / INTEGRITY OF CLAIMS',methodTitle:'No black-box claims.',
 methodIntro:'Understand what this demonstrator calculates, what remains experimental and what independently verified evidence is still required.',
 researchStatus:'RESEARCH / NOT CERTIFIED',demonstrated:'VERIFIED BY THIS TEST',
 demonstratedTitle:'Technical capability',
 method1:'Deterministic impact detection on authored synthetic policy versions.',
 method2:'First-party technical replay of historical assessments.',
 method3:'A reproducible SHA-256 receipt for the bounded result.',
 notIndependent:'NOT INDEPENDENTLY VERIFIED',notVerifiedTitle:'Research boundaries',
 limit1:'Real Canadian federal policy applicability or qualified clause-to-control mapping.',
 limit2:'An external benchmark, representative TRL 5 study or independent reviewer decision.',
 limit3:'Enterprise multi-tenant authorization, actual customer integrations or certified hosting.',
 researchSources:'RESEARCH & SOURCE DOCUMENTATION',
 sourceDirective:'Directive on Automated Decision-Making',sourceAia:'Algorithmic Impact Assessment',
 sourceCode:'AEGIS technical repository',footerText:'Decision assurance research',
 footerDisclosure:'Public synthetic environment · EN/FR',
 tracePolicy:'POLICY SOURCE',traceControls:'CONTROLS',traceSystems:'AI SYSTEMS',
 traceReplay:'NATIVE REPLAY',traceFindings:'FINDINGS',traceReceipt:'RESULT HASH',
 detailPolicy:'Synthetic policy version: all technical checks are bound to this test version.',
 detailControls:'Count of controls affected by the synthetic policy revision.',
 detailSystems:'Affected AI systems are identified separately from unaffected systems.',
 detailReplay:'Completed assessments have been recomputed. Active and planned work remains pending.',
 detailFindings:'Measured changes to technical findings. These are not compliance findings.',
 detailReceipt:'SHA-256 result hash for deterministic reproduction; human review is pending.',
 queueCompleted:'Completed — native replay',queueActive:'In progress — reassessment planned',
 queuePlanned:'Planned — requirements to update',MET:'MET',NOT_MET:'NOT MET',
 PARTIALLY_MET:'PARTIALLY MET',NOT_APPLICABLE:'NOT APPLICABLE',
 UNABLE_TO_DETERMINE:'UNABLE TO DETERMINE',changed:'Changed',unchanged:'Unchanged',
 noData:'None',yes:'YES',no:'NO',measuredUnavailable:'Not measured'
},
fr:{
 skip:'Aller à la plateforme',instance:'ENVIRONNEMENT DE RECHERCHE',navGroup1:'PLATEFORME',navGroup2:'ASSURANCE',
 navOverview:'Centre de commande',navSystems:'Systèmes d’IA',navPolicy:'Intelligence réglementaire',
 navEvaluation:'Laboratoire d’évaluation',navEvidence:'Registre des preuves',navReports:'Rapports et exports',
 navMethod:'Méthodologie',operatorLabel:'ÉTAT DE L’ASSURANCE',operatorValue:'Démonstration technique',
 private:'Espace privé',environment:'ENVIRONNEMENT FICTIF',openPrivate:'Espace privé',
 technical:'ÉVALUATION NATIVE REPRODUCTIBLE',statusCaution:'DONNÉES DE TEST',refresh:'Actualiser le scénario',
 loading:'Connexion au moteur natif…',errorTitle:'Impossible de charger les données fictives',
 errorMessage:'La démonstration publique est temporairement indisponible.',retry:'Réessayer',
 overviewKicker:'VUE D’ENSEMBLE',overviewRef:'EXÉCUTION 001 / REPRODUCTIBLE',
 overviewTitle:'L’intelligence décisionnelle devient observable.',
 overviewIntro:'Une modification de politique. Les systèmes touchés, les réévaluations techniques et les empreintes — liés dans un même espace.',
 inspectTrace:'Examiner le graphe',exportEvidence:'Exporter les preuves',
 disclaimer:'Cet environnement interactif utilise des politiques et systèmes d’IA fictifs. Les mesures techniques ne constituent pas des constats gouvernementaux ni une certification du NMT.',
 readLimits:'Méthode et limites',changedClauses:'Clauses modifiées',sourceVersioned:'Changement versionné',
 affectedSystems:'Systèmes d’IA touchés',inventoryBound:'Inscrits dans l’inventaire',
 nativeReplays:'Évaluations natives répétées',computed:'Calculé par le moteur',
 changedFindings:'Constats techniques modifiés',priorRetained:'Résultats initiaux conservés',
 impactOverline:'INTELLIGENCE DES CHANGEMENTS',impactTitle:'Ce qui a changé et ses effets',
 previousVersion:'VERSION PRÉCÉDENTE',currentVersion:'VERSION FICTIVE ACTUELLE',affectedLabel:'Systèmes touchés',
 unaffectedLabel:'Systèmes non touchés',scopeBySystem:'PORTÉE PAR SYSTÈME',viewInventory:'Voir l’inventaire',
 nativeOverline:'ÉVALUATION NATIVE / AVANT ET APRÈS',evaluationTitle:'Preuves recalculées',
 controlsTested:'CONTRÔLES',metLabel:'Satisfaits après réévaluation',notMetLabel:'Non satisfaits après réévaluation',
 otherLabel:'Autres / en attente',changedControls:'RÉSULTATS DES CONTRÔLES',viewEvaluation:'Voir l’évaluation',
 chainOverline:'GRAPHE DE PROVENANCE',chainTitle:'Une chaîne de décisions traçable',
 chainCaution:'La révision humaine n’est pas présentée comme terminée. Tous les chiffres proviennent du calcul technique.',
 workQueueOverline:'FILE DE RÉÉVALUATION',workQueueTitle:'Prochaines actions traçables',
 systemsKicker:'GOUVERNANCE / INVENTAIRE',systemsTitle:'Systèmes d’IA.',
 systemsIntro:'Examinez les systèmes fictifs touchés. Aucun responsable, fournisseur ou déploiement n’est inventé.',
 syntheticOnly:'JEU DE DONNÉES FICTIF',all:'Tous',affectedShort:'Touchés',unaffectedShort:'Non touchés',
 columnSystem:'IDENTIFIANT DU SYSTÈME',columnScope:'PORTÉE DE LA POLITIQUE',
 columnTest:'ÉVALUATION TECHNIQUE',columnAction:'DÉTAILS',
 sourceLimited:'Seuls les champs présents dans le résultat fictif sont affichés.',
 selectedSystem:'SYSTÈME SÉLECTIONNÉ',systemAffected:'Inclus dans le périmètre du changement.',
 systemUnaffected:'Non touché par cette modification fictive précise.',
 systemKnown:'Impact lié aux versions',systemNoPerSys:'Conclusion technique par système',
 systemNoPerSysValue:'Non établie dans ce résumé public',systemReview:'Réviseur humain',
 systemReviewValue:'Non vérifié de façon indépendante',systemRecorded:'Source de la preuve',
 systemRecordedValue:'Résultat natif fictif',details:'Examiner',noSystem:'Aucun système correspondant',
 matchCount:'systèmes affichés',searchSystem:'Rechercher un identifiant…',
 policyKicker:'CONTRÔLE DES MODIFICATIONS / POLITIQUES',policyTitle:'Intelligence réglementaire.',
 policyIntro:'Comparaison traçable de versions techniques et de systèmes touchés. Ce jeu fictif ne représente pas le texte réel des règles fédérales.',
 versionTracked:'VERSIONS TRACÉES',comparisonKicker:'COMPARAISON DES VERSIONS',comparisonTitle:'Vue de la révision',
 baseline:'VERSION INITIALE',baselineDesc:'Version de source technique initiale',revision:'RÉVISION',
 revised:'VERSION MODIFIÉE',revisedDesc:'Version de test fictive',changedControlsNumber:'Contrôles touchés',
 impactedInventory:'INVENTAIRE TOUCHÉ',unaffectedInventory:'INVENTAIRE INCHANGÉ',
 policyBoundary:'Aucune clause fédérale réelle ni applicabilité juridique n’est affirmée. Ouvrez le Workbench authentifié pour consulter les correspondances fictives.',
 evaluationKicker:'ÉVALUATION DES MODÈLES / RÉEXÉCUTION',evaluationPageTitle:'Laboratoire d’évaluation.',
 evaluationIntro:'Comparez les constats historiques et recalculés avec leurs mesures, et pas seulement un pourcentage statique.',
 nativeMeasured:'CALCUL SERVEUR',metricsKicker:'CONSTATS TECHNIQUES LIÉS AUX VERSIONS',
 findingsTitle:'Historique et recalcul',resultNotLaw:'AUCUNE CONCLUSION JURIDIQUE',
 control:'CONTRÔLE',original:'HISTORIQUE',recomputed:'RECALCULÉ',measured:'VALEUR MESURÉE',
 change:'MODIFICATION',originalPreserved:'Les résultats initiaux sont conservés; seuls les constats courants sont recalculés.',
 evaluationMethod:'MÉTHODE DE RÉÉVALUATION',methodDeterministic:'Déterministe et traçable.',
 methodNativeDescription:'Cette vue publique présente un résultat borné calculé au démarrage du service. Les nouvelles expériences se lancent dans l’espace privé.',
 openEvaluation:'Ouvrir l’évaluation privée',statusResult:'CONSTAT RÉGLEMENTAIRE',
 statusExplanation:'Un constat technique ne peut établir l’applicabilité ou le respect du droit fédéral sans correspondance réglementaire validée et révision qualifiée.',
 evidenceKicker:'PROVENANCE / HISTORIQUE',evidenceTitle:'Registre des preuves.',
 evidenceIntro:'Suivez la source modifiée jusqu’aux résultats natifs et à l’empreinte du calcul. Sélectionnez une étape pour consulter les faits connus.',
 receiptLinked:'LIÉ À SHA-256',graphKicker:'PROVENANCE DES DÉCISIONS',
 graphTitle:'Une modification. Traçabilité complète.',
 lineageHint:'Sélectionnez un nœud pour examiner sa provenance technique.',
 queueKicker:'ACTIONS DE RÉÉVALUATION',queueTitle:'Un état de travail n’est pas une approbation.',
 receiptKicker:'EMPREINTE DÉTERMINISTE',receiptTitle:'Reproductible, non certifié.',
 hashLabel:'EMPREINTE DU RÉSULTAT',copyReceipt:'Copier l’empreinte',copied:'Copié',
 humanPending:'Aucune révision humaine indépendante n’a été effectuée pour ce scénario public fictif.',
 reportsKicker:'RÉSULTATS D’AUDIT / REPRODUCTIBILITÉ',reportsTitle:'Rapports et exports.',
 reportsIntro:'Exportez les mesures fictives affichées. Les preuves privées et les dossiers d’organisation sont toujours exclus.',
 safeExport:'DONNÉES PUBLIQUES UNIQUEMENT',reportPaperTag:'RECHERCHE EN ASSURANCE / FICTIF',
 reportPaperTitle:'Impact des politiques et réévaluation native',
 reportPaperIntro:'Un dossier technique transparent, et non une évaluation réglementaire validée indépendamment.',
 reportSource:'VERSION SOURCE',reportChanges:'CONSTATS MODIFIÉS',reportOutcome:'CONSTAT JURIDIQUE',
 undetermined:'IMPOSSIBLE À DÉTERMINER',reportFoot:'PREUVES TECHNIQUES FICTIVES · NON CERTIFIÉES',
 exportOptions:'EXPORTATION',exportTitle:'Des preuves vérifiables.',
 exportDescription:'Le fichier JSON contient les mesures fictives publiques, la comparaison des versions, les constats et l’empreinte SHA-256. Il exclut les dossiers authentifiés.',
 downloadJson:'Télécharger le reçu technique JSON',detailedPrivate:'Ouvrir le studio privé de rapports bilingues',
 reportCaution:'Ce dossier est expérimental et ne constitue ni une AIA officielle ni un certificat NMT.',
 methodKicker:'MÉTHODES / INTÉGRITÉ DES AFFIRMATIONS',methodTitle:'Aucune affirmation opaque.',
 methodIntro:'Comprenez ce que calcule le démonstrateur, ce qui reste expérimental et les preuves indépendantes nécessaires.',
 researchStatus:'RECHERCHE / NON CERTIFIÉ',demonstrated:'DÉMONTRÉ PAR CE TEST',
 demonstratedTitle:'Capacités techniques',
 method1:'Détection déterministe des impacts sur des versions de politiques fictives.',
 method2:'Réexécution native des évaluations historiques.',
 method3:'Empreinte SHA-256 reproductible du résultat borné.',
 notIndependent:'NON VÉRIFIÉ INDÉPENDAMMENT',notVerifiedTitle:'Limites de la recherche',
 limit1:'Applicabilité des politiques fédérales canadiennes et correspondances approuvées.',
 limit2:'Benchmark externe, étude représentative du NMT 5 ou révision indépendante.',
 limit3:'Autorisation multiorganisationnelle, connexions réelles ou hébergement certifié.',
 researchSources:'RECHERCHE ET DOCUMENTATION',sourceDirective:'Directive sur la prise de décisions automatisée',
 sourceAia:'Évaluation de l’incidence algorithmique',sourceCode:'Référentiel technique AEGIS',
 footerText:'Recherche sur l’assurance décisionnelle',footerDisclosure:'Environnement fictif public · EN/FR',
 tracePolicy:'SOURCE DE POLITIQUE',traceControls:'CONTRÔLES',traceSystems:'SYSTÈMES D’IA',
 traceReplay:'RÉÉVALUATION NATIVE',traceFindings:'CONSTATS',traceReceipt:'EMPREINTE',
 detailPolicy:'Version de politique fictive : les contrôles sont liés à cette version de test.',
 detailControls:'Nombre de contrôles touchés par la révision fictive.',
 detailSystems:'Les systèmes touchés et non touchés sont identifiés séparément.',
 detailReplay:'Les évaluations terminées sont recalculées. Les travaux futurs restent en attente.',
 detailFindings:'Modifications mesurées des constats techniques, pas des décisions de conformité.',
 detailReceipt:'Empreinte SHA-256 reproductible; la révision humaine reste en attente.',
 queueCompleted:'Terminé — réévaluation native',queueActive:'En cours — réévaluation prévue',
 queuePlanned:'Planifié — mise à jour des exigences',
 MET:'SATISFAIT',NOT_MET:'NON SATISFAIT',
 PARTIALLY_MET:'PARTIELLEMENT SATISFAIT',NOT_APPLICABLE:'SANS OBJET',
 UNABLE_TO_DETERMINE:'IMPOSSIBLE À DÉTERMINER',changed:'Modifié',unchanged:'Inchangé',
 noData:'Aucun',yes:'OUI',no:'NON',measuredUnavailable:'Non mesuré'
}
};
const ids=['overview','systems','policy','evaluation','evidence','reports','method'];
let lang='en',payload=null,data=null,current='overview',systemFilter='all',systemSearch='',selectedSystem=null,selectedTrace=null;
const $=id=>document.getElementById(id),all=selector=>document.querySelectorAll(selector),tx=key=>copy[lang][key]??key;
const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text??'—');return e};
const icon=id=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','icon');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#ic-'+id);svg.append(use);return svg};
const set=(id,value)=>{const n=$(id);if(n)n.textContent=value??'—'};
const human=v=>v===null||v===undefined?'—':String(v);
const translatedStatus=value=>tx(value)||human(value);
const label=(value)=>human(value);
const statusClass=v=>v==='MET'?'good':v==='NOT_MET'?'bad':'pending';
function setLocale(){
 document.documentElement.lang=lang==='fr'?'fr-CA':'en-CA';document.documentElement.dir='ltr';
 document.title=lang==='fr'?'AEGIS — Plateforme d’assurance décisionnelle':'AEGIS — Decision Assurance Platform';
 for(const e of all('[data-i18n]')){const k=e.dataset.i18n;if(Object.hasOwn(copy[lang],k))e.textContent=tx(k)}
 $('locale').textContent=lang==='fr'?'FR / EN':'EN / FR';
 $('locale').setAttribute('aria-label',lang==='en'?'Switch to French':'Passer en anglais');
 $('system-search').placeholder=tx('searchSystem');
 $('system-search').setAttribute('aria-label',tx('searchSystem'));
 if(data)renderAll();
 showView(current,false);
}
function showView(view,updateHash=true){
 if(!ids.includes(view))return;
 current=view;
 all('[data-screen]').forEach(e=>e.classList.toggle('active',e.dataset.screen===view));
 all('[data-view]').forEach(e=>{
  const active=e.dataset.view===view;e.classList.toggle('active',active);
  if(active)e.setAttribute('aria-current','page');else e.removeAttribute('aria-current');
 });
 set('breadcrumb-current',tx('nav'+view[0].toUpperCase()+view.slice(1)));
 if(updateHash)history.replaceState(null,'','#'+view);
 closeMenu();
 window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
}
function closeMenu(){$('sidebar').classList.remove('open');$('backdrop').hidden=true;$('menu-button').setAttribute('aria-expanded','false');}
function openMenu(){$('sidebar').classList.add('open');$('backdrop').hidden=false;$('menu-button').setAttribute('aria-expanded','true');}
function systemIds(){return [...new Set([...data.affectedSystemIds,...data.unaffectedSystemIds])]}
function addTag(text,affected){
 const e=node('span','tag '+(affected?'affected':'unaffected'),text);return e;
}
function renderOverview(){
 const s=data.summary,affected=data.affectedSystemIds,unaffected=data.unaffectedSystemIds;
 for(const [id,val] of [['stat-clauses',s.changedClauses],['stat-systems',s.affectedSystems],['stat-replays',s.historicalAssessmentsReexecuted],['stat-findings',s.changedTechnicalFindings],['overview-affected',affected.length],['overview-unaffected',unaffected.length]])set(id,val);
 set('nav-systems-count',systemIds().length);
 set('before-version',data.sourceVersions.before);set('after-version',data.sourceVersions.after);
 $('impact-bar').style.width=((100*affected.length/Math.max(1,affected.length+unaffected.length))).toFixed(1)+'%';
 const list=$('overview-systems');list.replaceChildren();
 for(const id of systemIds()){
  const isAffected=affected.includes(id);
  const row=node('div','system-mini'),sym=node('span','small-icon');
  sym.append(icon('systems'));row.append(sym,node('span','',id),addTag(tx(isAffected?'affectedShort':'unaffectedShort'),isAffected));list.append(row);
 }
 const m=data.findingsTrace.filter(f=>f.recomputedCurrent==='MET').length;
 const n=data.findingsTrace.filter(f=>f.recomputedCurrent==='NOT_MET').length;
 const o=Math.max(0,data.findingsTrace.length-m-n),count=data.findingsTrace.length;
 set('met-count',m);set('notmet-count',n);set('other-count',o);set('controls-count',count);
 const x=100*m/Math.max(1,count),y=100*(m+n)/Math.max(1,count);
 $('findings-donut').style.background='conic-gradient(var(--green) 0 '+x+'%,var(--red) '+x+'% '+y+'%,#64717e '+y+'% 100%)';
 const findings=$('overview-findings');findings.replaceChildren();
 for(const f of data.findingsTrace.slice(0,4)){
  const row=node('div','mini-result');
  row.append(node('strong','',f.controlId),node('span','status good',translatedStatus(f.observedPrevious)),node('span','old-arrow','→'),node('span','status '+statusClass(f.recomputedCurrent)+' new-status',translatedStatus(f.recomputedCurrent)));
  findings.append(row);
 }
 const chain=$('overview-chain');chain.replaceChildren();
 const chainSteps=[['tracePolicy',data.sourceVersions.after],['traceSystems',s.affectedSystems],['traceReplay',s.historicalAssessmentsReexecuted],['traceReceipt',tx('noData')==='None'?'SHA-256':'SHA-256']];
 chainSteps.forEach(([k,v],i)=>{
  const e=node('div','chain-step');e.append(node('b','',tx(k)),node('span','',v));chain.append(e);
  if(i<chainSteps.length-1)chain.append(node('span','chain-arrow','→'));
 });
 const queue=$('overview-queue');queue.replaceChildren();
 for(const w of data.reassessmentQueue.slice(0,3)){
  const r=node('div','queue-mini'),left=node('div');
  left.append(node('b','',w.workItemId),node('small','',tx(w.phase==='COMPLETED'?'queueCompleted':w.phase==='IN_PROGRESS'?'queueActive':'queuePlanned')));
  r.append(left,node('span','queue-stage',w.phase));queue.append(r);
 }
}
function renderSystems(){
 const entries=systemIds().filter(id=>{
  const affected=data.affectedSystemIds.includes(id);
  return id.toLowerCase().includes(systemSearch.toLowerCase())&&(systemFilter==='all'||(systemFilter==='affected'?affected:!affected));
 });
 const table=$('systems-table');table.replaceChildren();
 entries.forEach(id=>{
  const affected=data.affectedSystemIds.includes(id);
  const row=node('tr'),name=node('td','system-name',id),scope=node('td'),evidence=node('td','',tx('systemNoPerSysValue')),action=node('td');
  scope.append(addTag(tx(affected?'affectedShort':'unaffectedShort'),affected));
  const btn=node('button','table-action',tx('details'));btn.type='button';btn.dataset.system=id;btn.addEventListener('click',()=>{selectedSystem=id;renderSystemDetail()});
  action.append(btn);row.append(name,scope,evidence,action);table.append(row);
 });
 if(!entries.length){const row=node('tr'),c=node('td','',tx('noSystem'));c.colSpan=4;row.append(c);table.append(row)}
 set('system-count-label',entries.length+' '+tx('matchCount'));
 if(!selectedSystem||!systemIds().includes(selectedSystem))selectedSystem=systemIds()[0]||null;
 renderSystemDetail();
}
function renderSystemDetail(){
 set('selected-system-title',selectedSystem||'—');
 const impacted=data.affectedSystemIds.includes(selectedSystem);
 set('selected-system-summary',selectedSystem?tx(impacted?'systemAffected':'systemUnaffected'):tx('noSystem'));
 const root=$('selected-system-meta');root.replaceChildren();
 for(const [key,value] of [
 ['systemKnown',tx(impacted?'affectedShort':'unaffectedShort')],
 ['systemNoPerSys',tx('systemNoPerSysValue')],
 ['systemReview',tx('systemReviewValue')],
 ['systemRecorded',tx('systemRecordedValue')]
 ]){
  const e=node('div');e.append(node('small','',tx(key)),node('strong','',value));root.append(e);
 }
}
function renderPolicy(){
 const s=data.summary;
 for(const [id,value] of [['policy-before',data.sourceVersions.before],['policy-after',data.sourceVersions.after],['policy-clauses',s.changedClauses],['policy-controls',s.changedControls],['policy-systems',s.affectedSystems]])set(id,value);
 for(const [id,items,affected] of [['affected',data.affectedSystemIds,true],['unaffected',data.unaffectedSystemIds,false]]){
  const el=$(id);el.replaceChildren();el.classList.toggle('muted',!affected);
  if(!items.length)el.append(node('span','',tx('noData')));
  items.forEach(s=>el.append(node('span','',s)));
 }
}
function renderEvaluation(){
 const table=$('findings-rows');table.replaceChildren();
 for(const f of data.findingsTrace){
  const row=node('tr');
  row.append(node('td','system-name',f.controlId));
  const previous=node('td'),current=node('td');previous.append(node('span','status '+statusClass(f.observedPrevious),translatedStatus(f.observedPrevious)));
  current.append(node('span','status '+statusClass(f.recomputedCurrent),translatedStatus(f.recomputedCurrent)));
  row.append(previous,current,node('td','',f.metricValue===null?tx('measuredUnavailable'):f.metricValue),node('td','',tx(f.changedFinding?'changed':'unchanged')));
  table.append(row);
 }
 set('evaluation-regulatory',translatedStatus(data.summary.regulatoryComplianceStatus));
}
const traceItems=()=>[
 {key:'tracePolicy',value:data.sourceVersions.after,detail:'detailPolicy'},
 {key:'traceControls',value:data.summary.changedControls,detail:'detailControls'},
 {key:'traceSystems',value:data.summary.affectedSystems,detail:'detailSystems'},
 {key:'traceReplay',value:data.summary.historicalAssessmentsReexecuted,detail:'detailReplay'},
 {key:'traceFindings',value:data.summary.changedTechnicalFindings,detail:'detailFindings'},
 {key:'traceReceipt',value:data.receiptHash.slice(0,16)+'…',detail:'detailReceipt'}
];
function renderTrace(){
 const holder=$('tour-lineage-nodes');holder.replaceChildren();
 traceItems().forEach((item,i)=>{
  const btn=node('button','trace-card'+(selectedTrace===i?' selected':''));btn.type='button';btn.dataset.trace=String(i);
  btn.setAttribute('aria-pressed',String(selectedTrace===i));btn.setAttribute('aria-label',tx(item.key)+': '+item.value);
  btn.append(node('span','trace-number',String(i+1).padStart(2,'0')),node('small','',tx(item.key)),node('strong','',item.value));
  holder.append(btn);
 });
 set('tour-lineage-detail',selectedTrace===null?tx('lineageHint'):tx(traceItems()[selectedTrace].detail));
}
function renderEvidence(){
 renderTrace();set('receipt',data.receiptHash);
 const holder=$('work-rows');holder.replaceChildren();
 for(const w of data.reassessmentQueue){
  const row=node('div','queue-row'),left=node('div');
  left.append(node('b','',w.workItemId),node('small','',tx(w.phase==='COMPLETED'?'queueCompleted':w.phase==='IN_PROGRESS'?'queueActive':'queuePlanned')));
  row.append(left,node('span','queue-stage',w.phase));holder.append(row);
 }
}
function renderReports(){
 set('report-version',data.sourceVersions.after);
 set('report-changes',data.summary.changedTechnicalFindings);
}
function renderAll(){
 renderOverview();renderSystems();renderPolicy();renderEvaluation();renderEvidence();renderReports();
}
function download(){
 if(!payload)return;
 const exported={
  type:'AEGIS_PUBLIC_SYNTHETIC_ASSURANCE_RECEIPT',source:'first-party native integrated evaluation',
  synthetic:true,evidenceCredited:false,independentlyReviewed:false,
  regulatoryComplianceEstablished:false,scope:'public fixed test input',
  result:data
 };
 const blob=new Blob([JSON.stringify(exported,null,2)+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=node('a');a.href=url;a.download='aegis-public-synthetic-evidence.json';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function copyReceipt(){
 if(!data)return;
 try{await navigator.clipboard.writeText(data.receiptHash);$('copy-receipt').querySelector('span').textContent=tx('copied');}
 catch{$('tour-lineage-detail').textContent=data.receiptHash;showView('evidence')}
}
async function load(){
 $('demo-loading').hidden=false;$('demo-error').hidden=true;$('demo-content').hidden=true;
 try{
  const r=await fetch('/api/public/demo',{credentials:'omit',headers:{Accept:'application/json'},cache:'no-store'});
  if(!r.ok)throw Error('Public result not available');
  const p=await r.json();
  if(p.synthetic!==true||p.evidenceCredited!==false||p.readOnly!==true||
   p.result?.kind!=='integrated-ai-assurance-simulation'||!Array.isArray(p.result?.findingsTrace)||
   !Array.isArray(p.result?.reassessmentQueue)||!Array.isArray(p.result?.affectedSystemIds)||
   !/^sha256:[a-f0-9]{64}$/.test(p.result.receiptHash))
   throw Error('Unverified result contract');
  payload=p;data=p.result;
  renderAll();$('demo-content').hidden=false;
 }catch(e){
  payload=null;data=null;$('demo-error').hidden=false;
 }finally{$('demo-loading').hidden=true}
}
function activate(){
 all('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
 all('[data-jump]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.jump)));
 $('view-trace').addEventListener('click',()=>showView('evidence'));
 $('locale').addEventListener('click',()=>{
  lang=lang==='en'?'fr':'en';setLocale();
 });
 $('menu-button').addEventListener('click',()=>{$('sidebar').classList.contains('open')?closeMenu():openMenu()});
 $('close-menu').addEventListener('click',closeMenu);$('backdrop').addEventListener('click',closeMenu);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
 $('system-search').addEventListener('input',e=>{systemSearch=e.target.value;if(data)renderSystems()});
 all('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  systemFilter=button.dataset.filter;all('[data-filter]').forEach(b=>{const selected=b===button;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected))});if(data)renderSystems();
 }));
 $('tour-lineage-nodes').addEventListener('click',e=>{
  const btn=e.target.closest('[data-trace]');if(!btn)return;selectedTrace=Number(btn.dataset.trace);renderTrace();
 });
 $('copy-receipt').addEventListener('click',copyReceipt);
 for(const name of ['overview-export','download-json'])$(name).addEventListener('click',download);
 for(const name of ['refresh','retry'])$(name).addEventListener('click',load);
 const hash=location.hash.slice(1);current=ids.includes(hash)?hash:'overview';setLocale();load();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',activate);else activate();
})();