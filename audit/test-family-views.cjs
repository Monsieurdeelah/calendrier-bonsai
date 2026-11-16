const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const photos=JSON.parse(fs.readFileSync('audit/photos-familles.json'));
const names=Object.keys(photos);
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE_PATH?{executablePath:process.env.BROWSER_EXECUTABLE_PATH}:{})});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const results=[];
 for(const viewport of [{width:1440,height:960},{width:390,height:844},{width:320,height:740}]){
  await page.setViewportSize(viewport);await page.goto(process.env.BONSAI_BASE_URL||'http://127.0.0.1:8765');
  await page.locator('#overviewBtn').click();
  assert.deepEqual(await page.locator('.type-label').evaluateAll(es=>es.map(e=>e.firstChild.textContent)),['Feuillus','Conifères','Tropicaux']);
  const order=await page.locator('tr.family-start').evaluateAll(es=>es.map(e=>e.dataset.family));assert.deepEqual(order,names);
  assert.equal(await page.locator('#annualPhoto img').count(),0);
  await page.locator('.overview-scroll').evaluate(e=>e.scrollLeft=600);
  assert(await page.locator('.type-label').first().evaluate(e=>e.getBoundingClientRect().right>0),'group label lost during horizontal scroll');
  await page.locator('.overview-scroll').evaluate(e=>e.scrollLeft=0);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page overflow');
  if(viewport.width===1440)assert(await page.locator('.overview-scroll').evaluate(e=>e.scrollWidth<=e.clientWidth),'PC months clipped');
  await page.locator('.type-separator').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:`audit/groupes-${viewport.width}.png`});
  for(const family of names){
   await page.selectOption('#overviewFamily',family);
   assert.equal(await page.locator('#annualPhoto img').count(),1);
   assert.equal(await page.locator('tr.family-start').getAttribute('data-family'),family);
   assert((await page.locator('#annualPhoto figcaption').textContent()).includes(photos[family].species));
   assert.equal(await page.locator('.type-label').count(),1);
  }
  await page.selectOption('#overviewFamily','Tamarin');
  await page.locator('#annualPhoto').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const i=document.querySelector('#annualPhoto img');return i.complete&&i.naturalWidth>0;},{},{timeout:20000});
  await page.screenshot({path:`audit/tamarin-annuel-${viewport.width}.png`});
  await page.locator('button[data-row]').first().click();await page.locator('[data-return]').first().click();
  assert.equal(await page.locator('#overviewFamily').inputValue(),'Tamarin');assert(await page.locator('#overviewView').isVisible());
  await page.locator('#monthlyBtn').click();
  await page.selectOption('#task','');await page.selectOption('#status','all');
  for(const family of names){await page.selectOption('#family',family);assert.equal(await page.locator('#monthlyPhoto img').count(),1);}
  await page.selectOption('#family','Tamarin');await page.locator('#monthlyPhoto').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const i=document.querySelector('#monthlyPhoto img');return i.complete&&i.naturalWidth>0;});
  await page.screenshot({path:`audit/tamarin-mensuel-${viewport.width}.png`});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'photo overflow');
  await page.selectOption('#status','optimal');assert.equal(await page.locator('#monthlyPhoto img').count(),1);assert.equal(await page.locator('#results .card').count(),0);
  await page.selectOption('#family','');assert.equal(await page.locator('#monthlyPhoto img').count(),0);
  results.push({viewport,groups:3,families:13,photoPanels:26,return:'OK',emptyFilters:'OK',overflow:'OK'});
 }
 // Real image loading for all thirteen sources, without substituting local images.
 await page.locator('#overviewBtn').click();
 for(const family of names){await page.selectOption('#overviewFamily',family);await page.locator('#annualPhoto').scrollIntoViewIfNeeded();await page.waitForFunction(()=>{const i=document.querySelector('#annualPhoto img');return i.complete&&i.naturalWidth>0;},{},{timeout:20000});}
 await page.route('https://thumb.wikimedia.org/**',r=>r.abort());
 await page.selectOption('#overviewFamily','Tamarin');await page.locator('#annualPhoto').scrollIntoViewIfNeeded();
 // Force an uncached unavailable URL to verify the genuine error path.
 await page.locator('#annualPhoto img').evaluate(i=>{i.src+='?unavailable-test='+Date.now()});
 await page.locator('#annualPhoto .photo-fallback').waitFor({state:'visible'});assert(await page.locator('#overviewTable').isVisible());
 assert.equal(await page.locator('#annualPhoto a').count(),2);assert.deepEqual(errors,[]);
 await page.locator('#monthlyBtn').click();await page.selectOption('#family','Tamarin');await page.locator('#monthlyPhoto').scrollIntoViewIfNeeded();
 await page.locator('#monthlyPhoto img').evaluate(i=>{i.src+='?unavailable-test='+Date.now()});await page.locator('#monthlyPhoto .photo-fallback').waitFor({state:'visible'});
 await page.locator('#overviewBtn').click();await page.selectOption('#overviewFamily','');assert.equal(await page.locator('#annualPhoto img').count(),0);
 fs.writeFileSync('audit/validation-familles.json',JSON.stringify({date:'2026-11-16',browser:'Microsoft Edge / Chromium headless',results,realExternalImages:13,fallback:'OK',consoleErrors:errors,limits:'Mobile émulé ; aucun iPhone/Safari physique testé.'},null,2)+'\n');
 console.log('OK: 3 widths, 13 families in both views, real photos, return, filters and fallback');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
