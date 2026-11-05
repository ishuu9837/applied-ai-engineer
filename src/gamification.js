export function calculateXP(progress, lessons) {
  const tasks = Object.values(progress.tasks || {}).filter(Boolean).length;
  const completed = Array.isArray(progress.done) ? new Set(progress.done).size : 0;
  const quiz = Object.values(progress.quiz || {}).reduce((sum, result) => sum + (result?.submitted ? Math.max(0, Math.min(5, Number(result.score) || 0)) : 0), 0);
  const hunts = Object.entries(progress.bugHunts || {}).reduce((sum, [day, choice]) => sum + (BUG_HUNTS[Number(day)]?.answer === choice ? 1 : 0), 0);
  return tasks * 20 + completed * 40 + quiz * 10 + hunts * 25;
}
export const LEVELS = [
  {xp:0, name:'Cadet', label:'Learn the tools'},
  {xp:100, name:'Navigator', label:'Navigate the basics'},
  {xp:250, name:'Builder', label:'Ship working features'},
  {xp:500, name:'Operator', label:'Debug real systems'},
  {xp:950, name:'Architect', label:'Design for reliability'},
  {xp:1500, name:'Field Engineer', label:'Solve customer problems'}
];
export function rankFor(xp) {
  let rank = 0; for (let i=0; i<LEVELS.length; i++) if (xp >= LEVELS[i].xp) rank=i;
  const here = LEVELS[rank], next = LEVELS[rank+1];
  return { ...here, next:next || null, progress:next ? Math.max(0, Math.min(100, Math.round((xp-here.xp)/(next.xp-here.xp)*100))) : 100 };
}
export const BUG_HUNTS = {
  1:{tag:'Security Incident',title:'The leaked token',scenario:'A teammate added .env to .gitignore after accidentally committing an API key. Is the secret now safe?', options:['Yes. The history no longer contains it.','No. Rotate the exposed key and remove it from Git history.','Only if the repo is private.'],answer:1,explanation:'Git ignore does not erase commits. Revoke/rotate the credential first, then scrub history as needed and prevent future leaks.'},
  2:{tag:'Data Integrity',title:'The multiplying invoice',scenario:'A customers table (one row/customer) is joined to invoices (many rows/customer). A customer-level balance is SUMmed after the join and suddenly doubles. Why?', options:['The database changed the original balance.','SQL SUM is unreliable for MONEY.','The join duplicated the customer-level balance across invoice rows.'],answer:2,explanation:'Join grain is wrong for the aggregate. Aggregate invoices at the customer level before joining, or sum at the correct grain.'},
  3:{tag:'API Reliability',title:'The silent 500',scenario:'A FastAPI route receives a negative invoice amount. Instead of validating the request it raises a generic server error. What is the better first fix?',options:['Add a Field(ge=0) constraint and assert the response is HTTP 422.','Return HTTP 200 with a string error.','Catch all exceptions and silently ignore them.'],answer:0,explanation:'Reject malformed client inputs at the schema boundary; preserve server exceptions for genuine server faults.'}
};
