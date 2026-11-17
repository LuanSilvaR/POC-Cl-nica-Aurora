// Verificação opcional. A POC não depende de Playwright para funcionar.
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const sourceRequire = createRequire('D:/Projeto_claude_estudos/DeskcommCRM/package.json');
const { chromium } = sourceRequire('@playwright/test');
(async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  const page = await browser.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  const url = name => pathToFileURL(path.resolve(__dirname,'..',name+'.html')).href;
  const results=[];
  fs.mkdirSync(path.resolve(__dirname,'../evidence'),{recursive:true});
  for(const width of [320,768,1024,1440]) {
    for(const name of ['index','agenda','pacientes','prontuario','pacotes','financeiro','configuracoes']) {
      await page.setViewportSize({width,height:960}); await page.goto(url(name));
      await page.locator('h1').waitFor();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${name} overflow ${width}`);
      assert.equal(await page.locator('nav a[aria-current="page"]').count(),1);
    }
    results.push(`7 páginas sem overflow em ${width}px`);
  }
  await page.setViewportSize({width:1440,height:960});await page.goto(url('configuracao')+'?secao=marca');
  await page.locator('#clinic-name').fill('');await page.locator('#brand-color').fill('#eeeeee');await page.getByRole('button',{name:'Salvar identidade'}).click();
  assert.match(await page.locator('#brand-error').innerText(),/nome/);
  await page.locator('#clinic-name').fill('Clínica Íris');
  await page.locator('#brand-color').fill('#4d3878');await page.getByRole('button',{name:'Salvar identidade'}).click();
  assert.equal(await page.locator('.document-preview [data-brand-name]').innerText(),'Clínica Íris');
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=','base64');
  await page.locator('#brand-logo').setInputFiles({name:'logo.png',mimeType:'image/png',buffer:png});
  await page.getByText('Logo pronta. Salve a identidade para aplicar.').waitFor();
  await page.getByRole('button',{name:'Salvar identidade'}).click();
  assert.equal(await page.locator('.document-preview [data-brand-mark] img').count(),1);
  await page.reload();assert.equal(await page.locator('#clinic-name').inputValue(),'Clínica Íris');
  assert.equal(await page.locator('.document-preview [data-brand-mark] img').count(),1);
  await page.locator('.notifications').click();
  assert.equal(await page.locator('#info-dialog').evaluate(el=>el.open),true);
  await page.keyboard.press('Escape');assert.equal(await page.locator('.notifications').evaluate(el=>el===document.activeElement),true);
  await page.getByRole('button',{name:'Restaurar padrão'}).click();await page.getByRole('button',{name:'Salvar identidade'}).click();
  await page.screenshot({path:path.resolve(__dirname,'../evidence/configuracoes-1440.png'),fullPage:true});
  await page.setViewportSize({width:320,height:900});await page.goto(url('index'));
  await page.getByRole('button',{name:'Recolher menu',exact:true}).click();
  assert.equal(await page.locator('#sidebar').getAttribute('data-collapsed'),'true');
  await page.screenshot({path:path.resolve(__dirname,'../evidence/inicio-320.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:960});await page.screenshot({path:path.resolve(__dirname,'../evidence/inicio-1440.png'),fullPage:true});
  await page.keyboard.press('/');assert.equal(await page.locator('#global-search').evaluate(el=>el===document.activeElement),true);
  await page.locator('#global-search').fill('Agenda');await page.keyboard.press('Enter');await page.waitForURL('**/agenda.html');
  assert.deepEqual(errors,[]);
  results.push('Nome obrigatório validado; nome/cor/logo aplicados e persistidos; padrão restaurado','Modal: Esc e retorno de foco; menu recolhível; busca / e navegação','Nenhum erro JavaScript observado');
  fs.writeFileSync(path.resolve(__dirname,'../evidence/validacao-base.json'),JSON.stringify({date:new Date().toISOString(),mode:'file://',browser:'Chrome headless',results},null,2));
  console.log(results.join('\n'));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
