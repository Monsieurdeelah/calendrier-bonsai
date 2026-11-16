import fs from 'node:fs';
const choices = [
['Azalée satsuki','Rhododendron indicum (satsuki)','Pescia, museo del bonsai, rhododendron indicum satsuki, stile moyogi (eretto informale), dal giappone, circa 30 anni.jpg'],
['Charme','Carpinus betulus','Bonsai Carpinus Betulus, Hainbuche, frei aufrechte Form, Alter ca. 70 Jahre, Japanischer Garten Bad Langensalza.jpg'],
['Chêne','Quercus robur','Pescia, museo del bonsai, quercus robur, stile hokidachi (a scopa), da italia, circa 50 anni.jpg'],
['Érables du Japon','Acer palmatum « Shindeshojo »','Acer Palmatum bonsai.jpg'],
['Hêtre','Fagus sylvatica','Fagus sylvatica - Portland Japanese Garden - Portland, Oregon - DSC08155.jpg'],
['Chamaecyparis','Chamaecyparis obtusa','Chamaecyparis Obtusa bonsai.JPG'],
['Juniperus chinensis','Juniperus chinensis','Bonsai - juniperus chinensis (1960).jpg'],
['Mélèzes','Larix decidua','Larix decidua Bonzai 01 by Line1.jpg'],
['Pin blanc du Japon','Pinus parviflora','Japanese White Pine bonsai 81, October 10, 2008.jpg'],
['Pin noir du Japon','Pinus thunbergii','Japanese Black Pine bonsai 135, October 10, 2008.jpg'],
['Pin sylvestre','Pinus sylvestris','Scots Pine bonsai 237, 2011-05-29.jpg'],
['Ficus','Ficus microcarpa','2023 Bonsai Ficus Microcarpa Bot Zahr Praha.jpg'],
['Tamarin','Tamarindus indica','Tamarindus indica - Morikami Museum and Japanese Gardens - Palm Beach County, Florida - DSC03480.jpg']
];
const api = async params => {for(let n=0;n<5;n++){const r=await fetch('https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({format:'json',...params}),{headers:{'User-Agent':'BonsaiCalendar/3.1 (photo attribution audit)'}});if(r.status===429){await new Promise(r=>setTimeout(r,15000));continue;}if(!r.ok)throw Error(r.status);return r.json();}throw Error('Wikimedia rate limit');};
if(!choices[2][2]){console.log(JSON.stringify(await api({action:'query',list:'categorymembers',cmtitle:'Category:Quercus bonsai',cmlimit:'50'})));process.exit(0);}
const clean=s=>s.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#160;/g,' ').trim();
const photos=fs.existsSync('audit/photos-familles.json')?JSON.parse(fs.readFileSync('audit/photos-familles.json','utf8')):{};
fs.mkdirSync('audit/photo-review',{recursive:true});
for(const [family,species,file] of choices){
 if(photos[family]?.file===file)continue;
 await new Promise(r=>setTimeout(r,1500));
 const result=await api({action:'query',prop:'imageinfo',iiprop:'url|extmetadata|size',iiurlwidth:'960',titles:'File:'+file});
 const page=Object.values(result.query.pages)[0];const info=page.imageinfo?.[0];if(!info)throw Error(file);
 const m=info.extmetadata;const original=info.url.split('?')[0];
 photos[family]={species,file,source:info.descriptionurl,author:clean(m.Artist.value),license:m.LicenseShortName.value,licenseUrl:m.LicenseUrl?.value||'https://creativecommons.org/publicdomain/mark/1.0/',image:info.thumburl.split('?')[0],original,width:info.thumbwidth,height:info.thumbheight,description:clean(m.ImageDescription?.value||''),checked:'2026-11-16'};
 const r=await fetch(photos[family].image);if(!r.ok)throw Error(file+' '+r.status);fs.writeFileSync('audit/photo-review/'+choices.findIndex(x=>x[0]===family)+'.jpg',Buffer.from(await r.arrayBuffer()));
 console.log(family+' : '+photos[family].author+' / '+photos[family].license);
 fs.writeFileSync('audit/photos-familles.json',JSON.stringify(photos,null,2)+'\n');
}
fs.writeFileSync('audit/photos-familles.json',JSON.stringify(photos,null,2)+'\n');
