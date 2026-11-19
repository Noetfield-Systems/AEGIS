/** Fully synthetic aligned policy-and-evaluation fixture for an end-to-end vertical slice. */
import {createGoldenFixture} from './golden.mjs';
import {contentHash} from '../assurance/replay.mjs';

export function integratedFixture(){
 const replay=createGoldenFixture();
 const sourceId='DIRECTIVE_ADM'; // Reference only; clauses below do not quote or model actual federal law.
 replay.scenarioId='synthetic-integrated-001';
 const rule=(id,text,section)=>({id,text,section});
 const old=[
  rule('RULE-DATA','Synthetic tolerance: duplicate rate must not exceed 0.5','Synthetic 1'),
  rule('RULE-MODEL','Synthetic tolerance: classifier accuracy must be at least 0.9','Synthetic 2'),
  rule('RULE-OUTPUT','Synthetic tolerance: output pass rate must be at least 0.5','Synthetic 3')
 ];
 const next=[
  rule('RULE-DATA','Synthetic tolerance: duplicate rate must be zero','Synthetic 1'),
  old[1],
  rule('RULE-OUTPUT','Synthetic tolerance: output pass rate must be at least 1.0','Synthetic 3')
 ];
 const mappings=[
  {id:'C-DATA',clauseId:'RULE-DATA',kind:'data',metric:'duplicateRate',operator:'<=',threshold:0,mappingStatus:'PROPOSED'},
  {id:'C-MODEL',clauseId:'RULE-MODEL',kind:'classifier',metric:'accuracy',operator:'>=',threshold:0.9,mappingStatus:'PROPOSED'},
  {id:'C-OUTPUT',clauseId:'RULE-OUTPUT',kind:'output',metric:'passRate',operator:'>=',threshold:1,mappingStatus:'PROPOSED'}
 ];
 const policy={
  sourceId,before:{version:replay.before.version,sourceDigest:contentHash(old),clauses:old},
  after:{version:replay.after.version,sourceDigest:contentHash(next),clauses:next},
  mappings,
  systems:replay.systems.map(s=>({id:s.id,controlIds:[...s.controlIds]})),
  workItems:[
   ...replay.assessments.map(a=>({id:a.id,systemId:a.systemId,phase:'COMPLETED'})),
   {id:'pending-A',systemId:'synthetic-A',phase:'IN_PROGRESS'},
   {id:'planned-A',systemId:'synthetic-A',phase:'PLANNED'},
   {id:'planned-B',systemId:'synthetic-B',phase:'PLANNED'}
  ]
 };
 return {scenarioId:replay.scenarioId,policy,replay};
}
