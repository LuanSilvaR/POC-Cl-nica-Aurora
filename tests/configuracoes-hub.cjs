const {createRequire}=require('node:module'),{pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=createRequire('D:/Projeto_claude_estudos/DeskcommCRM/package.json')('@playwright/test');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const base=path.resolve(__dirname,'..'),url=n=>pathToFileURL(path.join(base,n+'.html')).href;
 await page.goto(url('configuracoes'));await page.locator('.settings-hub-link').first().waitFor();
 const catalog=await page.evaluate(()=>window.SettingsCatalog);assert.equal(catalog.length,13);assert.equal(await page.locator('.settings-hub-group').count(),4);assert.equal(await page.locator('#page-content form').count(),0);
 await page.locator('#settings-search').fill('clinicos');assert.equal(await page.locator('.settings-hub-link').count(),1);assert.equal(await page.locator('.settings-hub-link h3').innerText(),'Modelos clínicos');
 await page.locator('#settings-search').fill('naoexiste');assert.equal(await page.locator('#settings-no-results').isVisible(),true);await page.locator('#clear-settings-search').click();assert.equal(await page.locator('.settings-hub-link').count(),13);
 await page.getByRole('button',{name:'Recolher menu',exact:true}).click();
 for(const theme of ['light','dark']){
  if(theme==='dark'){await page.getByRole('button',{name:'Menu do usuário',exact:true}).click();await page.getByRole('menuitem',{name:'Ativar tema escuro',exact:true}).click();}
  for(const width of [320,768,1024,1440]){
   await page.setViewportSize({width,height:1000});await page.goto(url('configuracoes'));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`hub/${theme}/${width}`);
   for(const item of catalog){await page.locator(`[data-config="${item.id}"]`).click();await page.getByRole('heading',{name:item.title,exact:true}).first().waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${item.id}/${theme}/${width}`);assert.equal(await page.locator('.settings-nav').count(),0);assert.ok((await page.locator('.settings-detail-panels').innerText()).length>100);assert.equal(await page.getByRole('button',{name:'Menu do usuário',exact:true}).isVisible(),true);await page.getByRole('link',{name:'Voltar',exact:true}).click();await page.locator('.settings-hub-link').first().waitFor();}
  }
 }
 await page.goto(url('configuracao')+'?secao=marca');await page.locator('#brand-color').fill('#4d3878');await page.getByRole('button',{name:'Salvar identidade',exact:true}).click();await page.getByRole('link',{name:'Voltar',exact:true}).click();await page.locator('.settings-hub-link').first().waitFor();assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--brand-seed').trim()),'#4d3878');
 await page.goto(url('configuracao')+'?secao=naoexiste');await page.getByRole('heading',{name:'Configuração não encontrada',exact:true}).waitFor();
 await page.goto(url('configuracoes')+'#marca');await page.waitForURL('**/configuracao.html?secao=marca');
 const evidence=path.join(base,'evidence');fs.mkdirSync(evidence,{recursive:true});
 for(const width of [320,1440]){await page.setViewportSize({width,height:1000});await page.goto(url('configuracoes'));await page.screenshot({path:path.join(evidence,`configuracoes-hub-dark-${width}.png`),fullPage:true});}
 await page.goto(url('configuracao')+'?secao=conexoes');await page.screenshot({path:path.join(evidence,'configuracao-conexoes-dark-1440.png'),fullPage:true});
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(evidence,'validacao-configuracoes-hub.json'),JSON.stringify({date:new Date().toISOString(),groups:4,options:13,hubCases:8,detailCases:104,checks:['13 destinos próprios com navegação de retorno','Busca por descrição/nome, acentos e vazio recuperável','Sem formulários no hub; sem submenu lateral nos detalhes','Claros/escuros, 320/768/1024/1440 sem overflow','Marca persistida, link antigo #marca e destino inválido tratados'],errors},null,2));console.log('Hub: 4 grupos e 13 opções. 8 cenários de hub + 104 detalhes sem overflow; busca, retorno, marca e rotas verificados.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
