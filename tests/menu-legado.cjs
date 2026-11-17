const {createRequire}=require('node:module');const {pathToFileURL}=require('node:url');const path=require('node:path');const fs=require('node:fs');const assert=require('node:assert/strict');
const {chromium}=createRequire('D:/Projeto_claude_estudos/DeskcommCRM/package.json')('@playwright/test');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=path.resolve(__dirname,'..');const url=n=>pathToFileURL(path.join(base,n+'.html')).href;
 await page.goto(url('index'));
 const trigger=()=>page.getByRole('button',{name:'Menu do usuário',exact:true});
 await trigger().click({timeout:3000});
 await page.getByRole('menuitem',{name:'Ativar tema escuro'}).click();
 assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 const expected={'--bg':'#161510','--surface':'#1d1c17','--soft':'#272620','--text':'#f5f4ef','--muted':'#8e8b7f','--border':'#33312a'};
 for(const [token,value] of Object.entries(expected))assert.equal(await page.evaluate(t=>getComputedStyle(document.documentElement).getPropertyValue(t).trim(),token),value);
 for(const width of [320,768,1024,1440])for(const name of ['index','agenda','pacientes','prontuario','pacotes','financeiro','configuracoes','visoes-gerais']){
  await page.setViewportSize({width,height:1000});await page.goto(url(name));
  assert.equal(await page.getByRole('menuitem',{name:'Sair do sistema'}).count(),0);
  await trigger().click();await page.getByText('rafael.mendes@clinica.example',{exact:true}).waitFor();
  const rect=await page.locator('#user-popover').boundingBox();assert.ok(rect.x>=0&&rect.x+rect.width<=width&&rect.y>=0);
  assert.equal(await page.getByRole('menuitem',{name:'Ativar tema claro'}).count(),1);
  await page.keyboard.press('Escape');assert.equal(await trigger().getAttribute('aria-expanded'),'false');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 }
 await page.goto(url('index'));await trigger().focus();await page.keyboard.press('ArrowDown');
 assert.equal(await page.getByRole('menuitem',{name:'Ativar tema claro'}).evaluate(e=>e===document.activeElement),true);
 await page.keyboard.press('ArrowDown');assert.equal(await page.getByRole('menuitem',{name:'Sair do sistema'}).evaluate(e=>e===document.activeElement),true);
 await page.keyboard.press('Escape');assert.equal(await trigger().evaluate(e=>e===document.activeElement),true);
 await trigger().click();await page.locator('h1').click();await page.waitForFunction(()=>document.querySelector('.user-menu-trigger').getAttribute('aria-expanded')==='false');assert.equal(await trigger().getAttribute('aria-expanded'),'false');
 await trigger().click();await page.getByRole('menuitem',{name:'Sair do sistema'}).click();await page.getByRole('button',{name:'Continuar no sistema'}).click();assert.equal(await trigger().evaluate(e=>e===document.activeElement),true);
 const evidence=path.join(base,'evidence');fs.mkdirSync(evidence,{recursive:true});
 for(const width of [320,1440]){await page.setViewportSize({width,height:1000});await trigger().click();await page.screenshot({path:path.join(evidence,`menu-legado-dark-${width}.png`),fullPage:true});await page.keyboard.press('Escape');}
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(evidence,'validacao-menu-legado.json'),JSON.stringify({date:new Date().toISOString(),legacyTokens:expected,checks:['32 páginas/larguras com popup dentro da janela','Tema e saída apenas no popup','Nome/e-mail fictícios, ícones, teclado, Escape e clique externo','Cancelamento da saída restaura foco no avatar'],errors},null,2));
 console.log('Menu e tema legado: 32 cenários, tokens, ações internas, foco, teclado e fechamento passaram.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
