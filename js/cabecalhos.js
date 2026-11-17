// Padrão comum: ações à direita, título/descrição em um container, depois conteúdo.
document.addEventListener('DOMContentLoaded',()=>{
  const content=document.getElementById('page-content');
  if(!content)return;
  document.querySelector('.sidebar-bottom>p')?.remove();
  content.querySelectorAll('.notice').forEach(el=>{if(/dados fictícios|ambiente de demonstração|proposta de detalhe|indicadores e alertas ilustram/i.test(el.textContent))el.remove();});
  document.getElementById('preferences-info')?.closest('.card')?.remove();
  content.querySelector('.settings-detail-footer')?.remove();
  const heading=content.querySelector('.page-heading');if(!heading)return;
  const actions=document.createElement('nav');actions.className='page-actions';actions.setAttribute('aria-label','Ações da página');
  const back=content.querySelector('.settings-detail-back');
  if(back){back.textContent='Voltar';back.classList.add('button','secondary');actions.append(back);}
  const existing=[...heading.children].filter(el=>el!==heading.firstElementChild);
  existing.forEach(el=>actions.append(el));
  const summary=content.querySelector('.welcome-summary');if(summary){heading.firstElementChild.append(summary);summary.classList.remove('welcome-summary');summary.classList.add('page-purpose');}
  const visible=el=>!el.closest('[hidden]');
  const forms=[...content.querySelectorAll('form')].filter(visible);
  forms.forEach((form,index)=>{
    if(form.id==='clinical-form')return;
    const submit=form.querySelector('button[type=submit]');if(!submit)return;
    if(form.closest('.settings-layout'))return;
    if(form.id==='team-form'){const row=document.createElement('div');row.className='context-actions';submit.before(row);row.append(submit);return;}
    if(!form.id)form.id='page-form-'+index;
    submit.setAttribute('form',form.id);
    if(form.id!=='brand-form')submit.textContent=forms.length>1?'Salvar expediente':'Salvar';
    actions.append(submit);
  });
  const empty=content.querySelector('.empty');
  if(empty?.querySelector('h2')&&['agenda','pacientes','prontuario','pacotes','financeiro'].includes(document.body.dataset.page)){
    const link=empty.querySelector('a');if(link){link.textContent='Voltar';actions.append(link);}
    empty.querySelector('h2').textContent='Nenhum registro disponível';
    const purposes={agenda:'Aqui você poderá consultar horários e organizar os atendimentos por profissional e sala.',pacientes:'Aqui você poderá cadastrar pacientes e consultar seu histórico de relacionamento.',prontuario:'Aqui você poderá registrar anamnese, evolução e imagens do paciente.',pacotes:'Aqui você poderá acompanhar sessões contratadas, saldo e validade.',financeiro:'Aqui você poderá acompanhar receitas, despesas e recebimentos.'};
    empty.querySelector('p').textContent=purposes[document.body.dataset.page];
  }
  if(actions.children.length)heading.append(actions);
  const id=new URLSearchParams(location.search).get('secao');
  const purposes={organizacao:'Mantenha os dados cadastrais, contatos e preferências da clínica atualizados.',distribuicao:'Defina a distribuição dos novos clientes e a visibilidade da equipe.',tags:'Organize as etiquetas usadas em pacientes, conversas e funis.',billing:'Mantenha os dados de contato e o ciclo de cobrança atualizados.',conexoes:'Identifique o número e escolha como conectar o WhatsApp da clínica.',webhooks:'Defina o destino e os eventos que serão enviados a outros sistemas.',nuvemshop:'Defina a loja e os dados que deseja sincronizar com o CRM.','trunk-sip':'Configure os parâmetros do provedor de voz.','api-tokens':'Defina nome, escopo e validade do acesso para uma integração.',extensoes:'Confira o guia, as permissões solicitadas e seu estado.',profissionais:'Cadastre os profissionais, especialidades e salas de referência.','modelos-clinicos':'Defina os campos do formulário e os requisitos de finalização.'};
  const panel=content.querySelector('.settings-detail-panels .settings-panel');
  if(panel&&purposes[id]){const description=panel.querySelector('.setting-help');if(description)description.textContent=purposes[id];}
  const retention=document.getElementById('cfg-clinica-retentionDays');if(retention){const help=document.createElement('p');help.className='small muted';help.textContent='Informe o prazo definido na política de retenção da clínica.';retention.closest('label').append(help);}
});
