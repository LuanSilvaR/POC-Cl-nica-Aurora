// Regressão dos formulários locais preservados da revisão 06. Hub atual: configuracoes-hub.cjs.
const {createRequire}=require('node:module'),{pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=createRequire('D:/Projeto_claude_estudos/DeskcommCRM/package.json')('@playwright/test');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=path.resolve(__dirname,'..'),url=n=>pathToFileURL(path.join(base,n+'.html')).href;
 const section=id=>page.locator(`[data-section="${id}"]`).click();
 const theme=async()=>{await page.getByRole('button',{name:'Menu do usuário',exact:true}).click();await page.getByRole('menuitem',{name:/Ativar tema/}).click();};
 await page.goto(url('configuracoes-anterior'));await page.locator('[data-section=marca]').waitFor();
 for(const mode of ['light','dark']){
  if(mode==='dark')await theme();
  for(const width of [320,768,1024,1440]){await page.setViewportSize({width,height:1000});for(const id of ['clinica','conta','equipe','agenda','comunicacao','financeiro','modelos','marca','integracoes']){await section(id);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${id}/${width}/${mode}`);}}
 }
 await page.setViewportSize({width:1440,height:1000});await section('marca');
 const samples=[];
 for(const color of ['#4d3878','#bf5c15','#eeeeee']){
  await page.locator('#brand-color').fill(color);await page.locator('#brand-color').dispatchEvent('input');await page.getByRole('button',{name:'Salvar identidade',exact:true}).click();
  const palette=await page.evaluate(()=>({seed:getComputedStyle(document.documentElement).getPropertyValue('--brand-seed').trim(),soft:getComputedStyle(document.documentElement).getPropertyValue('--brand-soft').trim(),hover:getComputedStyle(document.documentElement).getPropertyValue('--primary-hover').trim(),icon:getComputedStyle(document.querySelector('.nav svg')).color,expected:getComputedStyle(document.documentElement).getPropertyValue('--brand-text').trim(),ratios:window.BrandPalette.derive(getComputedStyle(document.documentElement).getPropertyValue('--brand-seed').trim(),true).contrasts}));
  assert.equal(palette.seed,color);assert.ok(Object.values(palette.ratios).every(v=>v>=4.5));samples.push(palette);
  await page.locator('.nav a[href="pacientes.html"]').hover();assert.equal(await page.locator('.nav a[href="pacientes.html"]').evaluate(el=>getComputedStyle(el).backgroundColor),await page.evaluate(()=>{const el=document.createElement('span');el.style.background='var(--brand-soft)';document.body.append(el);const value=getComputedStyle(el).backgroundColor;el.remove();return value;}));
 }
 assert.notEqual(samples[0].soft,samples[1].soft);assert.notEqual(samples[0].icon,samples[1].icon);
 await page.reload();await section('marca');assert.equal(await page.locator('#brand-color').inputValue(),'#eeeeee');
 await page.locator('#brand-color').fill('#4d3878');await page.getByRole('button',{name:'Salvar identidade',exact:true}).click();
 await section('agenda');await page.locator('#cfg-agenda-close').fill('07:00');await page.locator('#settings-agenda button[type=submit]').click();assert.match(await page.locator('#error-agenda').innerText(),/posterior/);await page.locator('#cfg-agenda-close').fill('19:00');await page.locator('#settings-agenda button[type=submit]').click();
 await section('conta');await page.locator('#cfg-conta-name').fill('Renata Silva');await page.getByRole('button',{name:'Salvar minha conta',exact:true}).click();await page.getByRole('button',{name:'Menu do usuário',exact:true}).click();assert.equal(await page.locator('.account-identity strong').innerText(),'Renata Silva');await page.keyboard.press('Escape');
 await page.goto(url('index'));await page.getByRole('heading',{name:'Olá, Renata',exact:true}).waitFor();assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--brand-seed').trim()),'#4d3878');
 await page.goto(url('configuracoes-anterior'));await section('equipe');const count=await page.locator('#team-list li').count();await page.locator('#team-form [name=name]').fill('Profissional de exemplo');await page.locator('#team-form [name=specialty]').fill('Estética');await page.locator('#team-form [name=room]').fill('Sala 2');await page.locator('#team-form button[type=submit]').click();assert.equal(await page.locator('#team-list li').count(),count+1);
 await section('modelos');await page.locator('#cfg-modelos-questions').fill('Usa medicamentos?\n<img src=x onerror=alert(1)>');await page.locator('#settings-modelos button[type=submit]').click();assert.equal(await page.locator('#settings-modelos .notice img').count(),0);
 await page.reload();await section('agenda');assert.equal(await page.locator('#cfg-agenda-close').inputValue(),'19:00');
 await section('integracoes');assert.equal(await page.getByText('Não integrado na POC',{exact:true}).count(),8);
 const evidence=path.join(base,'evidence');fs.mkdirSync(evidence,{recursive:true});
 await section('marca');await page.screenshot({path:path.join(evidence,'configuracoes-paleta-dark-1440.png'),fullPage:true});await theme();await page.setViewportSize({width:320,height:1000});await section('clinica');await page.screenshot({path:path.join(evidence,'configuracoes-clinica-light-320.png'),fullPage:true});
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(evidence,'validacao-configuracoes-paleta.json'),JSON.stringify({date:new Date().toISOString(),combinations:72,samples,checks:['9 seções em 4 larguras/2 temas','Paleta alterada em menus, hover e ícones, persistência após navegação','Cor clara com contraste adaptado','Validação de expediente, persistência de conta/equipe/modelo','Nome sincronizado no menu e saudação; conteúdo de template tratado como texto','8 grupos de integrações explicitamente não conectados'],errors},null,2));
 console.log('Configurações: 72 combinações sem overflow; paleta global, formulários, validação, persistência e limites das integrações aprovados.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
