(() => {
 const content=document.getElementById('page-content');const id=new URLSearchParams(location.search).get('secao');const item=window.SettingsCatalog.find(entry=>entry.id===id);
 if(!item){content.innerHTML='<a href="configuracoes.html" class="settings-detail-back">Voltar às configurações</a><section class="card empty"><h1>Configuração não encontrada</h1><p>Escolha uma opção no hub de configurações.</p></section>';return;}
 const target=document.getElementById('settings-'+item.panel);const layout=content.querySelector('.settings-layout');
 const holder=document.createElement('div');holder.className='settings-detail-panels';target.hidden=false;holder.append(target);
 layout.replaceWith(holder);content.querySelector('.settings-note')?.remove();
 const heading=content.querySelector('.page-heading');heading.querySelector('h1').textContent=item.title;heading.querySelector('p').textContent=item.description;
 const back=document.createElement('a');back.href='configuracoes.html';back.className='settings-detail-back';back.textContent='← Todas as configurações';heading.before(back);
 const notice=document.createElement('p');notice.className='notice settings-detail-note';notice.textContent='Proposta de detalhe · dados fictícios. Os formulários salvam rascunhos neste navegador; não alteram o CRM nem conectam serviços.';heading.after(notice);
 const crumb=document.querySelector('.breadcrumb');crumb.replaceChildren();const link=document.createElement('a');link.href='configuracoes.html';link.textContent='Configurações';const current=document.createElement('span');current.setAttribute('aria-current','page');current.textContent=item.title;crumb.append(link,' / '+item.group+' / ',current);
 const extras={
  tags:['Impacto das alterações','Consulte os locais de uso antes de renomear, juntar ou excluir uma etiqueta.'],
  billing:['Plano e faturas','Nenhum plano conectado. Consulte o plano, as faturas e a situação dos pagamentos neste espaço.'],
  conexoes:['Saúde, reconexão e templates','Não conectado. Acompanhe o estado dos números, a reconexão por QR e os templates do canal oficial.'],
  webhooks:['Entrega e recuperação','Acompanhe os eventos enviados, as respostas do destino e as tentativas de reenvio.'],
  nuvemshop:['Dados que entram no CRM','Não conectado. Acompanhe a sincronização de pedidos e clientes após autorizar a loja.'],
  'trunk-sip':['Credenciais protegidas','Revise servidor, transporte e identificador do provedor. Preserve as credenciais de acesso em local protegido.'],
  'api-tokens':['Nenhuma chave emitida','Ainda não há chaves emitidas. Organize os acessos por integração, escopo, validade e último uso.'],
  extensoes:['Guias e permissões','Confira a origem, a versão, as permissões e o estado de cada guia antes da ativação.']
 };
 if(extras[id]){const [title,description]=extras[id];const card=document.createElement('section');card.className='card';const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.className='setting-help';p.textContent=description;card.append(h,p);holder.prepend(card);}
 if(id==='organizacao'){target.querySelector('h2').textContent='Identificação da empresa';}
 const index=window.SettingsCatalog.indexOf(item);const footer=document.createElement('nav');footer.className='settings-detail-footer';footer.setAttribute('aria-label','Navegação entre configurações');const home=document.createElement('a');home.href='configuracoes.html';home.textContent='Voltar ao hub';footer.append(home);if(index<window.SettingsCatalog.length-1){const next=window.SettingsCatalog[index+1],a=document.createElement('a');a.href='configuracao.html?secao='+next.id;a.textContent='Próxima: '+next.title;footer.append(a);}content.append(footer);
 history.replaceState(null,'',location.pathname+location.search);document.title=item.title+' | Configurações da clínica';
})();
