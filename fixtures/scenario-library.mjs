/** Three internally consistent, entirely synthetic government-style AI-assurance examples.
 * Each case is evaluated through the actual first-party policy → native replay engine.
 * Names, source clauses and observations are fictional and not governmental instruments.
 */
import {integratedFixture} from './integrated.mjs';
import {contentHash} from '../assurance/replay.mjs';
const definitions=[
 {id:'combined',name:'Multi-control tightening',nameFr:'Resserrement de plusieurs contrôles',
  description:'Two controls tighten, triggering native re-evaluation and changed findings.',
  descriptionFr:'Deux contrôles deviennent plus stricts, entraînant une réévaluation native et des constats modifiés.',
  scenarioId:'synthetic-integrated-001',tighten:['C-DATA','C-OUTPUT']},
 {id:'data',name:'Data integrity reassessment',nameFr:'Réévaluation de l’intégrité des données',
  description:'A single data integrity rule changes; unaffected model and output controls remain traceable.',
  descriptionFr:'Une seule règle d’intégrité change; les contrôles de modèle et de sorties non modifiés restent traçables.',
  scenarioId:'synthetic-data-tightening',tighten:['C-DATA']},
 {id:'model',name:'Model control with no new failures',nameFr:'Contrôle de modèle sans nouvelle non-conformité technique',
  description:'A model threshold changes across two systems but both native measurements still pass. No failure is fabricated.',
  descriptionFr:'Le seuil du modèle change pour deux systèmes, mais les deux mesures restent satisfaites. Aucun échec fictif.',
  scenarioId:'synthetic-model-threshold',tighten:['C-MODEL']}
];
export function scenarioLibrary(){
 return definitions.map(d=>{
  const f=integratedFixture(),previous=f.policy.before;
  if(d.id!=='combined'){
   f.scenarioId=d.scenarioId;f.replay.scenarioId=d.scenarioId;
   const thresholds={'C-DATA':d.tighten.includes('C-DATA')?0:0.5,
    'C-OUTPUT':d.tighten.includes('C-OUTPUT')?1:0.5,
    'C-MODEL':d.tighten.includes('C-MODEL')?1:0.9};
   f.replay.after.controls=f.replay.before.controls.map(c=>({...c,threshold:thresholds[c.id]}));
   f.policy.mappings=f.policy.mappings.map(m=>({...m,threshold:thresholds[m.id]}));
   const clauses={
    'RULE-DATA':'Synthetic tolerance: duplicate rate must be zero',
    'RULE-MODEL':'Synthetic tolerance: classifier accuracy must be exactly 1.0',
    'RULE-OUTPUT':'Synthetic tolerance: output pass rate must be at least 1.0'
   };
   const changed=new Set(d.tighten.map(c=>({'C-DATA':'RULE-DATA','C-OUTPUT':'RULE-OUTPUT','C-MODEL':'RULE-MODEL'})[c]));
   f.policy.after.clauses=previous.clauses.map(c=>changed.has(c.id)?{...c,text:clauses[c.id]}:{...c});
   f.policy.after.sourceDigest=contentHash(f.policy.after.clauses);
  }
  return {id:d.id,name:d.name,nameFr:d.nameFr,description:d.description,
   descriptionFr:d.descriptionFr,synthetic:true,fixture:f};
 });
}
