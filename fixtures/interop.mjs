/** Synthetic, consent-free examples exercising 3 interoperability contracts.
 * Not recorded external service connections or government data. */
export const interoperabilitySamples=Object.freeze([
 {adapter:'governance-inventory-v1',input:{
  recordId:'registry-001',systemId:'sample-ai-001',name:'Synthetic Eligibility Decision Assistant',
  aiRole:'DECISION_SUPPORT',lifecycle:'PILOT',ownerReference:'sample-owner-team'}},
 {adapter:'aia-assessment-v1',input:{
  assessmentId:'aia-sample-001',systemId:'sample-ai-001',impactLevel:2,
  status:'DRAFT',publishedAt:null,sourceUrl:'https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/algorithmic-impact-assessment.html'}},
 {adapter:'otel-agent-span-v1',input:{
  traceId:'0123456789abcdef0123456789abcdef',spanId:'0123456789abcdef',
  serviceName:'sample-agent-service',name:'synthetic.policy.evaluate',
  startTimeUnixNano:'1700000000000000000',endTimeUnixNano:'1700000000150000000',
  attributes:[{key:'gen_ai.operation.name',value:{stringValue:'evaluate'}},
   {key:'gen_ai.request.model',value:{stringValue:'sample-native-engine'}},
   {key:'prompt',value:{stringValue:'PRIVATE CONTENT MUST NOT APPEAR'}}]}}
]);
