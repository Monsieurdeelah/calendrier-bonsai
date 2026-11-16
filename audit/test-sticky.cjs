const fs=require('node:fs');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium,webkit}=require('playwright');
(async()=>{
 const engine=process.env.STICKY_WEBKIT?webkit:chromium;
 const browser=await engine.launch({headless:true,...(!process.env.STICKY_WEBKIT?{executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}:{})});
 const results=[];
 for(const width of [1440,390,375,320]){
  const context=await browser.newContext({viewport:{width,height:844},...(width<680?{isMobile:true,hasTouch:true,deviceScaleFactor:3}:{})});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.BONSAI_BASE_URL||pathToFileURL(require('node:path').resolve('index.html')).href);
  await page.locator('#overviewBtn').click();
  const families=await page.locator('#overviewFamily option').evaluateAll(es=>es.map(e=>e.value));
  const tasks=await page.locator('#overviewTask option').evaluateAll(es=>es.map(e=>e.value));
  let combinations=0;
  for(const family of families)for(const task of tasks){
   await page.selectOption('#overviewFamily',family);await page.selectOption('#overviewTask',task);
   for(const fraction of [0,.5,1]){
    await page.locator('.overview-scroll').evaluate((e,f)=>e.scrollLeft=f*(e.scrollWidth-e.clientWidth),fraction);
    await page.waitForTimeout(20);
    const geometry=await page.evaluate(()=>{
     const sc=document.querySelector('.overview-scroll'),r=sc.getBoundingClientRect();
     const cells=[...document.querySelectorAll('.matrix .familycol,.matrix .taskcol')];
     return {overflow:document.documentElement.scrollWidth>innerWidth,scroll:sc.scrollLeft,max:sc.scrollWidth-sc.clientWidth,cells:cells.map(e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);return {left:b.left-r.left,width:b.width,family:e.classList.contains('familycol'),position:s.position,bg:s.backgroundColor}}),labels:[...document.querySelectorAll('.type-label')].map(e=>{const b=e.getBoundingClientRect();return {left:b.left-r.left,right:b.right-r.left}})};
    });
    assert(!geometry.overflow,'page overflow');
    const fw=geometry.cells[0].width;
    for(const c of geometry.cells){assert.equal(c.position,'sticky');assert(Math.abs(c.left-(c.family?1:1+fw))<1.1,JSON.stringify({width,family,task,fraction,c,fw}));assert.notEqual(c.bg,'rgba(0, 0, 0, 0)');}
    for(const l of geometry.labels)assert(l.left>=0&&l.right<=width,'separator outside viewport');
    if(width===1440)assert.equal(geometry.max,0,'desktop months clipped');
   }
   combinations++;
  }
  await page.selectOption('#overviewFamily','');
  await page.selectOption('#overviewTask',{label:'Taille structurelle lourde'});
  await page.locator('.overview-scroll').evaluate(e=>e.scrollLeft=e.scrollWidth);
  await page.locator('.overview-scroll').scrollIntoViewIfNeeded();
  await page.screenshot({path:`audit/sticky-${width}.png`});
  await page.locator('.overview-scroll').evaluate(e=>e.scrollLeft=0);
  await page.locator('button[data-row]').first().click();await page.locator('[data-return]').first().click();
  assert.equal(await page.locator('#overviewTask option:checked').textContent(),'Taille structurelle lourde');
  assert.deepEqual(errors,[]);results.push({width,combinations,scrollPositions:3,errors});await context.close();
 }
 await browser.close();fs.writeFileSync('audit/validation-sticky.json',JSON.stringify({engine:process.env.STICKY_WEBKIT?'WebKit':'Edge/Chromium',results},null,2));console.log(JSON.stringify(results));
})().catch(e=>{console.error(e);process.exit(1)});
