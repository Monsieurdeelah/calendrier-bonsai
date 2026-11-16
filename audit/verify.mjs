import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync('index.html','utf8');
const data=JSON.parse(fs.readFileSync('audit/donnees-auditees.json','utf8'));
const old=JSON.parse(fs.readFileSync('audit/donnees-originales.json','utf8'));
const sources=JSON.parse(fs.readFileSync('audit/sources.json','utf8'));
assert.equal(old.length,91); assert.equal(data.length,118);
assert.equal(new Set(data.map(x=>x.family)).size,13);
assert.equal(new Set(data.map(x=>x.id)).size,data.length);
const allowed=new Set(['OPTIMAL','SOUS CONDITIONS','DÉCONSEILLÉ','HORS FENÊTRE','NON DOCUMENTÉ','NON APPLICABLE']);
for(const r of data){assert.equal(r.months.length,12,r.id); assert(r.months.every(x=>allowed.has(x)),r.id); assert(r.note&&r.confidence&&r.timingConfidence); assert(r.sources.every(x=>sources[x])); assert(r.originIds.every(id=>old.some(x=>x.id===id)));}
assert(old.every(x=>data.some(y=>y.originIds.includes(x.id))));
assert.equal(fs.readFileSync('audit/controle-1092-cases.csv','utf8').trim().split(/\r?\n/).length,1093);
const embedded=JSON.parse(html.match(/const DATA=([\s\S]*?);\nconst MONTHS/)[1]); assert.deepEqual(embedded,data);
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1]; new vm.Script(script);
class El {constructor(){this.value='';this.checked=true;this.children=[];this.attrs={};this.innerHTML='';}setAttribute(k,v){this.attrs[k]=v;}appendChild(c){this.children.push(c);}addEventListener(){}querySelector(s){return this[s]??=new El();}}
const els={}; const doc={getElementById:id=>els[id]??=new El(),createElement:()=>new El(),querySelectorAll:()=>els.months.children,addEventListener(){}};
const context=vm.createContext({document:doc,localStorage:{getItem:()=>null,setItem(){}},Date});
doc.getElementById('status').value='active';vm.runInContext(script,context);
let renders=0;
for(let m=0;m<12;m++)for(const f of ['',...new Set(data.map(x=>x.family))])for(const st of ['active','optimal','conditional','discouraged','unknown','na','off','all']){
els.family.value=f;els.status.value=st;vm.runInContext(`month=${m};render()`,context);
const expected=data.filter(x=>(!f||x.family===f)).filter(x=>{const v=x.months[m];return st==='all'||(st==='active'&&['OPTIMAL','SOUS CONDITIONS'].includes(v))||({optimal:'OPTIMAL',conditional:'SOUS CONDITIONS',discouraged:'DÉCONSEILLÉ',unknown:'NON DOCUMENTÉ',na:'NON APPLICABLE',off:'HORS FENÊTRE'}[st]===v)}).length;
assert(els.count.textContent.startsWith(expected+' intervention'),`${m} ${f} ${st}`);renders++;
}
els.task.value=data[0].task;els.family.value='';els.status.value='all';vm.runInContext('render()',context);assert(els.count.textContent.startsWith(data.filter(x=>x.task===data[0].task).length+' intervention'));
for(const f of ['',...new Set(data.map(x=>x.family))]){els.overviewFamily.value=f;vm.runInContext('renderOverview()',context);assert.equal((els.overviewTable.querySelector('tbody').innerHTML.match(/<tr data-family=/g)||[]).length,data.filter(x=>!f||x.family===f).length);}
assert(!data.filter(x=>x.family==='Tamarin').some(x=>x.months.includes('OPTIMAL')));
assert(data.filter(x=>x.family==='Pin blanc du Japon'||x.family==='Pin sylvestre').every(x=>!x.task.includes('Mekiri')));
let annualCombinations=0;
for(const f of ['',...new Set(data.map(x=>x.family))])for(const t of ['',...Object.keys(vm.runInContext('INTERVENTION_TYPES',context))]){els.overviewFamily.value=f;els.overviewTask.value=t;vm.runInContext('renderOverview()',context);const output=els.overviewTable.querySelector('tbody').innerHTML;const expected=vm.runInContext('DATA.filter(x=>(!$("overviewFamily").value||x.family===$("overviewFamily").value)&&(!$("overviewTask").value||interventionType(x)===$("overviewTask").value)).map(x=>x.id)',context);assert.equal((output.match(/<tr data-family=/g)||[]).length,expected.length);assert.equal((output.match(/class="cellbutton"/g)||[]).length,expected.length*12);if(!expected.length)assert(output.includes('Aucune intervention'));annualCombinations++;}
els.overviewFamily.value='';els.overviewTask.value='T1';vm.runInContext('renderOverview()',context);assert.equal((els.overviewTable.querySelector('tbody').innerHTML.match(/<tr data-family=/g)||[]).length,13);
els.overviewTask.value='T4';vm.runInContext('renderOverview()',context);assert.equal((els.overviewTable.querySelector('tbody').innerHTML.match(/<tr data-family=/g)||[]).length,13);
assert.equal(vm.runInContext('DATA.filter(x=>interventionType(x)==="T10").length',context),1);
const result={annualCombinations,date:'2026-11-16',originalRows:old.length,originalCells:old.length*12,proposedRows:data.length,proposedCells:data.length*12,monthlyFilterRenders:renders,annualViews:14,syntax:'OK',coverage:'OK',note:'DOM simulé ; pas de vérification visuelle réelle ni de validation biologique par les tests.'};
fs.writeFileSync('audit/validation.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
