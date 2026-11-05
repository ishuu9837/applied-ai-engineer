export const START_DATE = '2026-11-06';
export const BASE_PATH = '/applied-ai-engineer/';
export const RELEASE_DATES = ['2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09'];
export const phases = [
 {key:'foundations', label:'01 / Foundations', description:'Only fill the gaps', range:'Days 01–03'},
 {key:'pipeline', label:'02 / Data + ML Pipeline', description:'Project 1: production-style scoring API', range:'Days 04–09'},
 {key:'assistant', label:'03 / Customer AI Assistant', description:'Project 2: grounded answers + tools', range:'Days 10–16'},
 {key:'finetune', label:'04 / Fine-tuning', description:'Bounded experiments, measured gains', range:'Days 17–18'},
 {key:'hiring', label:'05 / FDE + Hiring', description:'Prove your work in interviews', range:'Days 19–20'}
];
export const roadmap = [
 [1,'Diagnostic & project hygiene','foundations'],[2,'SQL + Python essentials','foundations'],[3,'FastAPI + Docker','foundations'],
 [4,'Databricks & Spark','pipeline'],[5,'Delta, quality & medallion','pipeline'],[6,'Features & honest baselines','pipeline'],
 [7,'Train + MLflow tracking','pipeline'],[8,'Registry, scoring & drift','pipeline'],[9,'Ship Project 1','pipeline'],
 [10,'LLM APIs & structured output','assistant'],[11,'RAG fundamentals','assistant'],[12,'Hybrid search & reranking','assistant'],
 [13,'Evaluation harness','assistant'],[14,'Tool calling + guardrails','assistant'],[15,'Production API & UI','assistant'],
 [16,'Public demo + measurement','assistant'],[17,'QLoRA + baseline','finetune'],[18,'Fine-tune & compare','finetune'],
 [19,'FDE customer simulation','hiring'],[20,'Mock interview + career kit','hiring']
].map(([day,title,phase])=>({day,title,phase}));
export function releaseDateFor(day){const batch=Math.floor((day-1)/5); return RELEASE_DATES[batch]||null;}
export function currentISTDate(date=new Date()){
 const parts = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
 const get=(k)=>parts.find(p=>p.type===k)?.value;
 return `${get('year')}-${get('month')}-${get('day')}`;
}
export function isAvailable(day,releasedDays,nowIST=currentISTDate()){
 return nowIST>=releaseDateFor(day) && releasedDays.includes(day);
}
