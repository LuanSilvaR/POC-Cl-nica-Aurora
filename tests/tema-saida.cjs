const {createRequire}=require('node:module');
const {pathToFileURL}=require('node:url');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const {chromium}=createRequire('D:/Projeto_claude_estudos/DeskcommCRM/package.json')('@playwright/test');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=path.resolve(__dirname,'..');const url=name=>pathToFileURL(path.join(base,name+'.html')).href;
 const menu=()=>page.getByRole('button',{name:'Menu do usuário',exact:true}).click();
 const choose=async name=>{await menu();await page.getByRole('menuitem',{name,exact:true}).click();};
 await page.goto(url('index'));
 await choose('Ativar tema escuro');
 assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 for(const width of [320,768,1024,1440])for(const name of ['index','agenda','pacientes','prontuario','pacotes','financeiro','configuracoes','visoes-gerais']){
  await page.setViewportSize({width,height:1000});await page.goto(url(name));
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await menu();assert.equal(await page.getByRole('menuitem',{name:'Sair do sistema',exact:true}).isVisible(),true);await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${name}/${width}`);
  if(name==='visoes-gerais')for(const profile of ['administrador','recepcao','medico']){
   await page.locator(`[data-profile="${profile}"]`).click();
   for(const state of ['normal','loading','empty','error']){
    await page.locator('#scenario').selectOption(state);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${profile}/${state}/${width}/dark`);
   }
  }
 }
 const contrastResults=await page.evaluate(()=>{
  const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const lum=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
  const css=getComputedStyle(document.documentElement),get=n=>rgb(css.getPropertyValue(n).trim());
  return [['--text','--surface'],['--muted','--bg'],['--link','--soft']].map(([a,b])=>{const x=lum(get(a)),y=lum(get(b));return {pair:a+'/'+b,ratio:(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};});
 });for(const r of contrastResults)assert.ok(r.ratio>=4.5,JSON.stringify(r));
 await page.goto(url('index'));
 await page.getByRole('heading',{name:'Olá, Rafael',exact:true}).waitFor();
 assert.equal(await page.locator('.page-heading time').innerText(),await page.evaluate(()=>'Hoje — '+new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',weekday:'long',day:'numeric',month:'long'}).format(new Date())+'.'));
 for(const text of ['Recebido no mês','Saldo vencido','Ocupação da agenda','Retorno de pacientes','Decisões que precisam de atenção','Capacidade por profissional'])assert.equal(await page.getByText(text,{exact:true}).count(),1);
 await choose('Sair do sistema');
 await page.getByRole('button',{name:'Continuar no sistema'}).click();assert.equal(page.url(),url('index'));
 await choose('Sair do sistema');
 await page.getByRole('button',{name:'Confirmar saída'}).click();await page.waitForURL('**/saida.html');
 await page.goto(url('pacientes'));await page.waitForURL('**/saida.html');
 await page.getByRole('button',{name:'Entrar na demonstração'}).click();await page.waitForURL('**/login.html');await page.locator('#email').fill('demo@clinica.example');await page.locator('#password').fill('exemplo');await page.getByRole('button',{name:'Entrar',exact:true}).click();await page.waitForURL('**/index.html');
 assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await choose('Ativar tema claro');
 assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
 assert.deepEqual(errors,[]);console.log('32 cenários escuros: tema persistido, saída no popup e sem overflow. Painel do administrador, cancelamento, saída, bloqueio local e reentrada passaram.');
 fs.mkdirSync(path.join(base,'evidence'),{recursive:true});
 fs.writeFileSync(path.join(base,'evidence','validacao-tema-saida.json'),JSON.stringify({date:new Date().toISOString(),browser:'Chrome headless',mode:'file://',darkPages:32,darkProfileStates:48,contrastResults,errors,logout:'confirmar/cancelar/reentrada/navegação direta verificados'},null,2));
 for(const theme of ['light','dark']){if(theme==='dark')await choose('Ativar tema escuro');for(const width of [320,1440]){await page.setViewportSize({width,height:1000});await page.screenshot({path:path.join(base,'evidence',`administrador-${theme}-${width}.png`),fullPage:true});}}
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
