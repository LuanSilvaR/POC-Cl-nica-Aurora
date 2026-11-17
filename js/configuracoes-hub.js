(() => {
 const content=document.getElementById('page-content');
 const hiddenFromHub=new Set(['tags']);
 const advancedIds=new Set(['webhooks','nuvemshop','trunk-sip','api-tokens','extensoes']);
 const visibleCatalog=window.SettingsCatalog.filter(item=>!hiddenFromHub.has(item.id));
 const groups=[...new Set(visibleCatalog.filter(item=>!advancedIds.has(item.id)).map(item=>item.group))];
 content.innerHTML='<div class="page-heading"><div><h1>Configurações</h1><p>Dados da clínica, canais de atendimento, marca e integrações.</p></div></div><div class="settings-hub-search"><label for="settings-search">Encontrar uma configuração</label><input id="settings-search" type="search" placeholder="Busque por nome ou assunto…" aria-describedby="settings-count"><p id="settings-count" class="small muted" role="status" aria-live="polite"></p></div><div id="settings-groups"></div><div class="card empty" id="settings-no-results" hidden><h2>Nenhuma configuração encontrada</h2><p>Tente outro termo ou limpe a busca para ver todas as opções.</p><button type="button" class="button secondary" id="clear-settings-search">Limpar busca</button></div>';
 const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
 const search=document.getElementById('settings-search');
 function render(){
  const query=normalize(search.value.trim());const matches=visibleCatalog.filter(item=>normalize(item.title+' '+item.description+' '+item.group).includes(query));
  const holder=document.getElementById('settings-groups');holder.replaceChildren();
  groups.forEach((group,index)=>{const items=matches.filter(item=>item.group===group&&!advancedIds.has(item.id));if(!items.length)return;const section=document.createElement('section');section.className='settings-hub-group';const h=document.createElement('h2');h.id='settings-group-'+index;h.textContent=group;section.setAttribute('aria-labelledby',h.id);const grid=document.createElement('div');grid.className='settings-hub-grid';
   items.forEach(item=>{const link=document.createElement('a');link.className='settings-hub-link';link.href=item.id==='papeis-acesso'?'papeis-acesso.html':item.id==='minha-seguranca'?'minha-seguranca.html':item.id==='billing'?'formas-pagamento.html':'configuracao.html?secao='+item.id;link.dataset.config=item.id;const icon=document.createElement('span');icon.className='settings-hub-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5M8 17h3"/></svg>';const text=document.createElement('div');const title=document.createElement('h3');title.textContent=item.title;const p=document.createElement('p');p.textContent=item.description;text.append(title,p);link.append(icon,text);grid.append(link);});section.append(h,grid);holder.append(section);
  });
  const advanced=matches.filter(item=>advancedIds.has(item.id));if(advanced.length){const details=document.createElement('details');details.className='settings-advanced';details.open=Boolean(query);const summary=document.createElement('summary');summary.textContent='Integrações e recursos avançados';details.append(summary);const grid=document.createElement('div');grid.className='settings-hub-grid';advanced.forEach(item=>{const link=document.createElement('a');link.className='settings-hub-link';link.href='configuracao.html?secao='+item.id;link.dataset.config=item.id;const text=document.createElement('div'),title=document.createElement('h3'),p=document.createElement('p');title.textContent=item.title;p.textContent=item.description;text.append(title,p);link.append(text);grid.append(link)});details.append(grid);holder.append(details)}
  document.getElementById('settings-no-results').hidden=matches.length>0;document.getElementById('settings-count').textContent=matches.length+' de '+visibleCatalog.length+' configurações';
 }
 search.oninput=render;document.getElementById('clear-settings-search').onclick=()=>{search.value='';render();search.focus();};
 const aliases={clinica:'organizacao',equipe:'profissionais',modelos:'modelos-clinicos'};const hash=location.hash.slice(1);if(hash&&window.SettingsCatalog.some(item=>item.id===(aliases[hash]||hash))){location.replace('configuracao.html?secao='+(aliases[hash]||hash));return;}
 render();
})();
