const {createRequire}=require('node:module'),{pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=createRequire('D:/Projeto_claude_estudos/DeskcommCRM/package.json')('@playwright/test');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const base=path.resolve(__dirname,'..'),url=n=>pathToFileURL(path.join(base,n+'.html')).href;
 await page.goto(url('configuracao')+'?secao=organizacao');await page.locator('.page-actions').waitFor();
 for(const theme of ['light','dark']){
  if(theme==='dark'){await page.getByRole('button',{name:'Menu do usuário',exact:true}).click();await page.getByRole('menuitem',{name:'Ativar tema escuro',exact:true}).click();}
  for(const width of [320,768,1024,1440]){
   await page.setViewportSize({width,height:1000});
   for(const route of ['index','agenda','pacientes','prontuario','pacotes','financeiro','configuracoes','configuracao']){
    await page.goto(url(route)+(route==='configuracao'?'?secao=organizacao':''));await page.locator('.page-heading').waitFor();
    assert.equal(await page.locator('.breadcrumb').count(),1);assert.equal(await page.locator('.breadcrumb [aria-current="page"]').count(),1);assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${route}/${width}/${theme}`);
    assert.doesNotMatch(await page.locator('#content').innerText(),/dados fictícios|indicadores e alertas ilustram|proposta de detalhe/i);
    if(route==='configuracao'){
     const action=await page.getByRole('button',{name:'Salvar',exact:true}).boundingBox(),heading=await page.locator('.page-heading').boundingBox();assert.equal(await page.locator('.page-heading .page-actions button').count(),1);assert.ok(action.y>=heading.y&&action.y+action.height<=heading.y+heading.height);assert.ok(heading.x+heading.width-(action.x+action.width)<=22);assert.equal(await page.getByRole('button',{name:'Salvar',exact:true}).locator('svg[aria-hidden=true]').count(),1);assert.equal(await page.getByRole('link',{name:'Voltar',exact:true}).locator('svg[aria-hidden=true]').count(),1);
     assert.equal(await page.getByRole('heading',{name:'Retenção e privacidade',exact:true}).count(),0);
    }
   }
  }
 }
 await page.locator('#cfg-clinica-legalName').fill('Clínica para teste do cabeçalho');await page.getByRole('button',{name:'Salvar',exact:true}).click();await page.reload();assert.equal(await page.locator('#cfg-clinica-legalName').inputValue(),'Clínica para teste do cabeçalho');
 await page.goto(url('configuracao')+'?secao=marca');await page.locator('#clinic-name').fill('Clínica cabeçalho');await page.getByRole('button',{name:'Salvar identidade',exact:true}).click();await page.reload();assert.equal(await page.locator('#clinic-name').inputValue(),'Clínica cabeçalho');
 const evidence=path.join(base,'evidence');fs.mkdirSync(evidence,{recursive:true});
 await page.evaluate(()=>{localStorage.removeItem('aurora-brand');localStorage.removeItem('aurora-settings-clinica');});
 for(const width of [320,1440]){await page.setViewportSize({width,height:1000});await page.goto(url('configuracao')+'?secao=organizacao');await page.screenshot({path:path.join(evidence,`organizacao-header-dark-${width}.png`),fullPage:true});}
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(evidence,'validacao-cabecalhos.json'),JSON.stringify({date:new Date().toISOString(),cases:64,checks:['8 telas × 4 larguras × 2 temas sem overflow','Breadcrumb presente; ações à direita antes do título, sem avisos repetidos','Um H1 por tela; retenção junto ao campo','Botões fora do formulário continuam salvando organização e marca'],errors},null,2));console.log('Cabeçalhos: 64 cenários aprovados; ações alinhadas, orientações breves e gravação dos formulários preservadas.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
