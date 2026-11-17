const {createRequire}=require('node:module');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=createRequire('D:/Projeto_claude_estudos/DeskcommCRM/package.json')('@playwright/test');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=path.resolve(__dirname,'..');const evidence=path.join(base,'evidence');fs.mkdirSync(evidence,{recursive:true});
  await page.goto(pathToFileURL(path.join(base,'visoes-gerais.html')).href);
  const results=[];
  for(const width of [320,768,1024,1440]){
    await page.setViewportSize({width,height:1000});
    for(const profile of ['administrador','recepcao','medico']){
      await page.locator(`[data-profile="${profile}"]`).click();
      assert.equal(await page.locator('[aria-pressed=true]').count(),1);
      for(const state of ['normal','loading','empty','error']){
        await page.locator('#scenario').selectOption(state);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${profile}/${state}/${width}`);
      }
      await page.getByRole('button',{name:'Tentar novamente'}).click();
      assert.equal(await page.locator('#scenario').inputValue(),'normal');
      const buttons=page.locator('[data-action]');
      for(let i=0;i<await buttons.count();i++){
        await buttons.nth(i).click();
        assert.equal(await page.locator('#action-dialog').evaluate(el=>el.open),true);
        assert.ok((await page.locator('#action-description').innerText()).length>20);
        await page.keyboard.press('Escape');
        assert.equal(await buttons.nth(i).evaluate(el=>el===document.activeElement),true);
      }
      await page.locator('[data-profile]').first().focus();
      if(width===1440||width===320)await page.screenshot({path:path.join(evidence,`visao-${profile}-${width}.png`),fullPage:true});
    }
    results.push(`3 perfis × 4 estados em ${width}px sem overflow; ações e recuperação verificadas`);
  }
  await page.locator('[data-profile="medico"]').focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('[data-profile="medico"]').getAttribute('aria-pressed'),'true');
  await page.goto(pathToFileURL(path.join(base,'visoes-gerais.html')).href+'?perfil=recepcao');
  assert.equal(await page.locator('[data-profile="recepcao"]').getAttribute('aria-pressed'),'true');
  assert.deepEqual(errors,[]);
  results.push('Seleção por teclado e URL de perfil verificadas; nenhum erro JavaScript observado');
  fs.writeFileSync(path.join(evidence,'validacao-visoes-gerais.json'),JSON.stringify({date:new Date().toISOString(),browser:'Chrome headless',mode:'file://',results},null,2));
  console.log(results.join('\n'));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
