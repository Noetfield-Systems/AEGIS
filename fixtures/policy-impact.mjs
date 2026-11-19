/* Synthetic policy excerpts and model/work records; NOT a captured Canadian policy instrument. */
export function policyImpactFixture(){
 const original='This sample instrument calls for a routine review of a model after release.';
 const revised='This sample instrument calls for a review of a model after a change in function or scope.';
 const unchanged='This sample instrument requires a documented technical owner.';
 const clause=(id,text,section='Synthetic Section 1')=>({id,section,text});
 return {
  sourceId:'AIA',
  before:{version:'synthetic-v1',sourceDigest:'sha256:'+'a'.repeat(64),
   clauses:[clause('CLAUSE-REVIEW',original),clause('CLAUSE-OWNER',unchanged,'Synthetic Section 2')]},
  after:{version:'synthetic-v2',sourceDigest:'sha256:'+'b'.repeat(64),
   clauses:[clause('CLAUSE-REVIEW',revised),clause('CLAUSE-OWNER',unchanged,'Synthetic Section 2')]},
  mappings:[
   {id:'CTRL-REVIEW',clauseId:'CLAUSE-REVIEW',kind:'classifier',metric:'accuracy',operator:'>=',threshold:0.9,mappingStatus:'PROPOSED'},
   {id:'CTRL-OWNER',clauseId:'CLAUSE-OWNER',kind:'output',metric:'passRate',operator:'>=',threshold:0.8,mappingStatus:'PROPOSED'}
  ],
  systems:[
   {id:'SIMULATED-DPT-A',controlIds:['CTRL-REVIEW','CTRL-OWNER']},
   {id:'SIMULATED-DPT-B',controlIds:['CTRL-OWNER']}
  ],
  workItems:[
   {id:'ASSESSMENT-A-COMPLETE',systemId:'SIMULATED-DPT-A',phase:'COMPLETED'},
   {id:'ASSESSMENT-A-ACTIVE',systemId:'SIMULATED-DPT-A',phase:'IN_PROGRESS'},
   {id:'ASSESSMENT-A-PLANNED',systemId:'SIMULATED-DPT-A',phase:'PLANNED'},
   {id:'ASSESSMENT-B-PLANNED',systemId:'SIMULATED-DPT-B',phase:'PLANNED'}
  ]
 };
}
