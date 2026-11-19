/**
 * AEGIS assessor-oriented, bilingual and print-ready technical report.
 * Uses a freshly computed integrated result, never invented external evidence.
 * HTML escaping is mandatory for all caller-provided text.
 */
const escape=s=>String(s??'—').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const arr=(v,n,max)=>{if(!Array.isArray(v)||v.length>max)throw new TypeError(n+' must be a bounded array');return v};
const statuses=new Set(['MET','NOT_MET','PARTIALLY_MET','NOT_APPLICABLE','UNABLE_TO_DETERMINE']);
const lex={
 en:{
  type:'Experimental technical evidence — NOT government approval',
  title:'Decision Assurance & Regulatory Replay',subtitle:'Reproducible technical assessment | Internal research record',
  executive:'Executive technical summary',scope:'Scope and research limitations',provenance:'Traceability & provenance',
  versions:'Policy version comparison',before:'Historical policy version',after:'Proposed policy version',
  scenario:'Scenario',system:'AI system',affected:'Affected systems',unaffected:'Unaffected systems',
  changes:'Changed policy clauses',controls:'Changed controls',replayed:'Completed assessments re-executed',technical:'Changed technical findings',
  replay:'Native historical assessment — before and after',ctrl:'Control',assessment:'Assessment',original:'Recorded earlier',recomputed:'Recomputed after change',value:'Native metric result',source:'Evidence input hash',change:'Changed',
  lifecycle:'Lifecycle propagation',stage:'Work stage',action:'Required action',job:'Work item',review:'Human oversight and audit',status:'Regulatory determination',pending:'Pending authorized specialist review',
  reviewScope:'Internal operator statement only; reviewer identity is not independently authenticated.',decision:'Operator decision',reviewer:'Unverified display name',reason:'Decision rationale',reviewedOn:'Recorded at',
  methods:'Methods and reproducibility',methodText:'The first-party evaluator re-executes controlled evidence-bound data, classifier and output checks using a versioned policy comparison. Existing historical findings are preserved. In-progress and planned work is queued for review rather than reported as completed.',
  evidence:'Evidence and reproducibility references',receipt:'Deterministic SHA-256 result hash',input:'SHA-256 input hash',policy:'Policy impact hash',native:'Native replay hash',
  sources:'Source references — official links, not verified document snapshots',limitations:'Scientific, legal and implementation limitations',
  note1:'All policy clauses and AI-system fixtures in this scenario are synthetic. No real federal legal applicability has been validated.',
  note2:'Technical findings are not legal compliance findings. UNABLE TO DETERMINE remains the regulatory outcome.',
  note3:'This report is not an independent scientific audit, a completed representative TRL 5 study or an ISC application assessment.',
  note4:'Data residency, individual reviewer identity, tenant isolation and full AIA instrument validation are not established by this report.',
  notReviewed:'No operator review has been recorded for this result.', yes:'Yes',no:'No',
  foot:'AEGIS — Noetfield Systems Inc. | Experimentally generated; not an official Government of Canada document.',
  recorded:'Recorded result',print:'Print or save to PDF',printHint:'Use your browser Print command (Ctrl/⌘ + P) to print or save this dossier as PDF.',tablecaption:'Native, deterministic provisional findings'
 },
 fr:{
  type:'Preuves techniques expérimentales — AUCUNE approbation gouvernementale',
  title:'Assurance décisionnelle et relecture réglementaire',subtitle:'Évaluation technique reproductible | Dossier de recherche interne',
  executive:'Sommaire technique',scope:'Portée et limites de la recherche',provenance:'Traçabilité et provenance',
  versions:'Comparaison des versions de politique',before:'Version historique',after:'Version proposée',
  scenario:'Scénario',system:'Système d’IA',affected:'Systèmes touchés',unaffected:'Systèmes non touchés',
  changes:'Clauses modifiées',controls:'Contrôles modifiés',replayed:'Évaluations terminées réexécutées',technical:'Résultats techniques modifiés',
  replay:'Réévaluation native — avant et après',ctrl:'Contrôle',assessment:'Évaluation',original:'Constat antérieur',recomputed:'Résultat recalculé',value:'Mesure native',source:'Empreinte des données',change:'Modification',
  lifecycle:'Propagation dans le cycle de vie',stage:'Étape',action:'Action requise',job:'Tâche',review:'Supervision humaine et audit',status:'Constat réglementaire',pending:'En attente de révision par un spécialiste autorisé',
  reviewScope:'Déclaration interne uniquement; l’identité du réviseur n’est pas authentifiée de façon indépendante.',decision:'Décision interne',reviewer:'Nom affiché non vérifié',reason:'Motif de la décision',reviewedOn:'Consigné le',
  methods:'Méthodes et reproductibilité',methodText:'L’évaluateur natif réexécute des contrôles des données, du classificateur et des sorties sur des preuves liées à une comparaison versionnée. Les constats historiques sont conservés. Les travaux en cours et planifiés sont mis en file pour révision, sans être déclarés terminés.',
  evidence:'Références et reproductibilité',receipt:'Empreinte SHA-256 du résultat',input:'Empreinte SHA-256 des données',policy:'Empreinte de l’impact',native:'Empreinte de la réévaluation native',
  sources:'Sources officielles — liens, pas de versions intégralement vérifiées',limitations:'Limites scientifiques, juridiques et techniques',
  note1:'Toutes les clauses et données de systèmes d’IA de ce scénario sont fictives. Aucune applicabilité juridique fédérale n’a été validée.',
  note2:'Les résultats techniques ne sont pas des conclusions juridiques. Le constat réglementaire demeure IMPOSSIBLE À DÉTERMINER.',
  note3:'Ce rapport ne constitue ni un audit scientifique indépendant, ni une étude représentative du NMT 5, ni une évaluation de candidature ISC.',
  note4:'Ce rapport n’atteste pas la résidence des données, l’identité individuelle du réviseur, l’isolement des organisations ou la validité de l’AIA complète.',
  notReviewed:'Aucun examen interne n’a été consigné pour ce résultat.',yes:'Oui',no:'Non',
  foot:'AEGIS — Noetfield Systems Inc. | Généré à titre expérimental; ceci n’est pas un document officiel du gouvernement du Canada.',
  recorded:'Résultat consigné',print:'Imprimer ou enregistrer en PDF',printHint:'Utilisez la commande Imprimer du navigateur (Ctrl/⌘ + P) pour imprimer ce dossier ou l’enregistrer en PDF.',tablecaption:'Constats techniques natifs provisoires et déterministes'
 }
};
const val=(v)=>escape(v===null||v===undefined?'—':v);
const point=(t,key,v)=>'<div class="datum"><span>'+escape(t[key])+'</span><strong>'+val(v)+'</strong></div>';
const link=(url,label)=>'<a href="'+escape(url)+'" rel="noopener noreferrer" target="_blank">'+escape(label)+'</a>';
export function renderIntegratedReport(result,{lang='en',review=null,generatedAt=''}={}){
 if(!lex[lang])throw new TypeError('language must be en or fr');
 if(!result||result.kind!=='integrated-ai-assurance-simulation'||result.iscEvidenceCredited!==false)throw new TypeError('expected a non-credited integrated result');
 if(!/^sha256:[a-f0-9]{64}$/.test(result.receiptHash||''))throw new TypeError('valid result hash required');
 const findings=arr(result.findingsTrace,'findingsTrace',150),queue=arr(result.reassessmentQueue,'reassessmentQueue',250);
 const impacted=arr(result.affectedSystemIds,'affectedSystemIds',60),unaffected=arr(result.unaffectedSystemIds,'unaffectedSystemIds',60);
 if(findings.some(f=>!statuses.has(f.recomputedCurrent)||!statuses.has(f.observedPrevious)))throw new TypeError('unknown finding status');
 if(review&&review.caseReceiptHash!==result.receiptHash)throw new TypeError('review receipt must match current result');
 const t=lex[lang],date=generatedAt?new Date(generatedAt).toISOString():null,when=date?'<span>'+escape(date)+'</span>':'';
 const figures=result.summary||{};
 const stats=[
  ['changes',figures.changedClauses],['controls',figures.changedControls],
  ['replayed',figures.historicalAssessmentsReexecuted],['technical',figures.changedTechnicalFindings]
 ].map(([k,n])=>point(t,k,n)).join('');
 const rows=findings.map(f=>'<tr><td>'+val(f.assessmentId)+'</td><td>'+val(f.controlId)+'</td><td>'+val(f.observedPrevious)+'</td><td>'+val(f.recomputedCurrent)+'</td><td>'+val(f.metricValue)+'</td><td><code>'+val(f.evidenceInputHash)+'</code></td></tr>').join('');
 const tasks=queue.map(w=>'<tr><td>'+val(w.workItemId)+'</td><td>'+val(w.phase)+'</td><td>'+val(w.action)+'</td><td>'+val(w.reviewRequired?t.yes:t.no)+'</td></tr>').join('');
 const reviewBlock=review?
  '<dl><dt>'+escape(t.decision)+'</dt><dd>'+val(review.decision)+'</dd><dt>'+escape(t.reviewer)+'</dt><dd>'+val(review.reviewerDisplayName)+'</dd><dt>'+escape(t.reason)+'</dt><dd>'+val(review.reason)+'</dd><dt>'+escape(t.reviewedOn)+'</dt><dd>'+val(review.recordedAt)+'</dd><dt>Event hash</dt><dd><code>'+val(review.eventHash)+'</code></dd></dl>'+
  '<p>'+escape(t.reviewScope)+'</p>':
  '<p>'+escape(t.notReviewed)+'</p>';
 const sources=[
  ['Directive on Automated Decision-Making','https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592'],
  ['Algorithmic Impact Assessment','https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/algorithmic-impact-assessment.html'],
  ['Guide on the Scope of the Directive','https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/guide-scope-directive-automated-decision-making.html']
 ].map(([label,url])=>'<li>'+link(url,label)+'</li>').join('');
 const safety=['note1','note2','note3','note4'].map(k=>'<li>'+escape(t[k])+'</li>').join('');
 return '<!doctype html><html lang="'+(lang==='fr'?'fr-CA':'en-CA')+'" dir="ltr"><head><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1"><title>AEGIS | '+escape(t.title)+'</title>'+
 '<style>:root{font-family:Inter,system-ui,Arial,sans-serif;color:#17212d}*{box-sizing:border-box}body{margin:0;background:#f4f1ec}main{max-width:1120px;margin:38px auto;background:#fff;padding:52px 60px;box-shadow:0 16px 50px #2222}.top{display:flex;justify-content:space-between;gap:16px;color:#847d6e;font-size:11px;text-transform:uppercase;letter-spacing:.08em}.brand{font-size:20px;font-weight:800;color:#17212d;letter-spacing:.15em}.strap{font-size:10px;font-weight:800;color:#8f703e;letter-spacing:.14em;margin-top:44px}h1{font-size:38px;letter-spacing:-.05em;line-height:1.15;max-width:740px;margin:8px 0 6px}h2{font-size:19px;letter-spacing:-.015em;margin:0 0 18px;border-bottom:1px solid #e3e4e7;padding-bottom:12px}p,li{line-height:1.7;color:#4e5665;font-size:12px}.subtitle{color:#858c94;font-size:13px}section{margin:34px 0}.banner{padding:12px 15px;background:#fcf5e9;color:#7c552d;border-left:4px solid #c19b63;font-weight:700;font-size:11px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.datum{border:1px solid #e2e3e8;border-radius:8px;padding:15px}.datum span{display:block;color:#69707f;font-size:10px}.datum strong{display:block;font-size:23px;color:#283442;margin-top:4px}.twocol{display:grid;grid-template-columns:1fr 1fr;gap:14px}.info{border:1px solid #e3e4e8;padding:18px;border-radius:9px}code{font:10px/1.5 ui-monospace,Consolas,monospace;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:10px}th{text-align:left;background:#f1f2f4;font-size:9px;letter-spacing:.02em}th,td{padding:10px 8px;border-bottom:1px solid #e2e3e8;vertical-align:top;overflow-wrap:anywhere}dl{display:grid;grid-template-columns:150px 1fr;gap:10px;font-size:11px}dt{color:#677181}dd{margin:0}a{color:#345d83}footer{border-top:1px solid #e2e3e8;padding-top:20px;color:#7c8793;font-size:10px}button{background:#14212c;color:#fff;padding:10px 18px;border:0;border-radius:5px;cursor:pointer}.toolbar{text-align:right;margin-bottom:14px}@media(max-width:650px){main{margin:0;padding:28px 17px}.metrics,.twocol{grid-template-columns:1fr 1fr}h1{font-size:30px}table{font-size:9px}}@media print{@page{size:A4;margin:13mm}body{background:#fff}main{margin:0;padding:0;box-shadow:none;max-width:none}.toolbar{display:none}section{break-inside:avoid}table{font-size:8px}thead{display:table-header-group}tr{break-inside:avoid}}</style>'+
 '</head><body><main><div class="toolbar" role="note">'+escape(t.printHint)+'</div><div class="top"><span class="brand">AEGIS</span>'+when+'<span>Noetfield Systems Inc.</span></div>'+
 '<div class="strap">TECHNICAL ASSURANCE / RESEARCH</div><h1>'+escape(t.title)+'</h1><p class="subtitle">'+escape(t.subtitle)+'</p><div class="banner">'+escape(t.type)+'</div>'+
 '<section><h2>'+escape(t.executive)+'</h2><div class="metrics">'+stats+'</div><p>'+escape(t.methodText)+'</p></section>'+
 '<section><h2>'+escape(t.versions)+'</h2><div class="twocol"><div class="info">'+point(t,'scenario',result.scenarioId)+point(t,'before',result.sourceVersions?.before)+'</div><div class="info">'+point(t,'status',figures.regulatoryComplianceStatus)+point(t,'after',result.sourceVersions?.after)+'</div></div><div class="twocol"><div class="info">'+point(t,'affected',impacted.join(', ')||'—')+'</div><div class="info">'+point(t,'unaffected',unaffected.join(', ')||'—')+'</div></div></section>'+
 '<section><h2>'+escape(t.replay)+'</h2><table><caption>'+escape(t.tablecaption)+'</caption><thead><tr><th>'+escape(t.assessment)+'</th><th>'+escape(t.ctrl)+'</th><th>'+escape(t.original)+'</th><th>'+escape(t.recomputed)+'</th><th>'+escape(t.value)+'</th><th>'+escape(t.source)+'</th></tr></thead><tbody>'+rows+'</tbody></table></section>'+
 '<section><h2>'+escape(t.lifecycle)+'</h2><table><thead><tr><th>'+escape(t.job)+'</th><th>'+escape(t.stage)+'</th><th colspan="2">'+escape(t.action)+'</th></tr></thead><tbody>'+tasks+'</tbody></table></section>'+
 '<section><h2>'+escape(t.review)+'</h2>'+reviewBlock+'</section>'+
 '<section><h2>'+escape(t.provenance)+'</h2><dl><dt>'+escape(t.receipt)+'</dt><dd><code>'+val(result.receiptHash)+'</code></dd><dt>'+escape(t.input)+'</dt><dd><code>'+val(result.sourceHash)+'</code></dd><dt>'+escape(t.policy)+'</dt><dd><code>'+val(result.policyImpactHash)+'</code></dd><dt>'+escape(t.native)+'</dt><dd><code>'+val(result.nativeReplayHash)+'</code></dd></dl></section>'+
 '<section><h2>'+escape(t.sources)+'</h2><ul>'+sources+'</ul></section>'+
 '<section><h2>'+escape(t.limitations)+'</h2><ul>'+safety+'</ul></section><footer>'+escape(t.foot)+'</footer></main></body></html>';
}
