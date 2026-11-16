import fs from 'node:fs';
const md=fs.readFileSync('audit/rapport-audit.md','utf8');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const inline=s=>esc(s).replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g,'<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
const lines=md.split('\n');let out='',table=false,list=false;
for(const line of lines){
 if(!line.startsWith('|')&&table){out+='</tbody></table></div>';table=false;}
 if(!line.startsWith('- ')&&list){out+='</ul>';list=false;}
 if(/^\|[-| ]+\|$/.test(line))continue;
 if(line.startsWith('|')){const cells=line.split('|').slice(1,-1).map(x=>x.trim());if(!table){out+='<div class="scroll"><table><thead><tr>'+cells.map(x=>'<th>'+inline(x)+'</th>').join('')+'</tr></thead><tbody>';table=true;}else out+='<tr>'+cells.map(x=>'<td>'+inline(x)+'</td>').join('')+'</tr>';continue;}
 const h=line.match(/^(#{1,3}) (.*)/);if(h){out+=`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`;continue;}
 if(line.startsWith('- ')){if(!list){out+='<ul>';list=true;}out+='<li>'+inline(line.slice(2))+'</li>';continue;}
 if(line.trim())out+='<p>'+inline(line)+'</p>';
}
if(table)out+='</tbody></table></div>';if(list)out+='</ul>';
fs.writeFileSync('audit/rapport-audit.html','<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Audit du calendrier bonsaï</title><style>body{font:16px/1.6 system-ui;color:#173129;background:#f4f6f1;max-width:1240px;margin:auto;padding:24px}h1,h2,h3{line-height:1.2}h2{margin-top:40px}h3{margin-top:32px}a{color:#235847}table{border-collapse:collapse;background:white;width:100%;font-size:13px}td,th{border:1px solid #cddbd0;padding:10px;text-align:left;min-width:110px;vertical-align:top}th{background:#e0ece4}.scroll{overflow:auto;margin:20px 0}code{overflow-wrap:anywhere}p{max-width:100ch}@media print{body{background:white;padding:0}.scroll{overflow:visible}table{font-size:9px}td,th{min-width:0;padding:4px}h3{break-before:page}}</style><body><a href="../index.html">← Calendrier proposé</a>'+out+'</body></html>');
