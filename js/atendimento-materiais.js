(()=>{
 'use strict';
 const stockKey='poc-estoque-prototipo-v1';
 const reservationKey='poc-reservas-materiais-v1';
 const makeId=()=>globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2);
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
 const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
 const fmtDate=value=>value?String(value).split('-').reverse().join('/'):'—';
 const productLabel=value=>String(value||'').replace(/\s*\((?:exemplo|fictício)\)\s*$/i,'');
 const procedures={'Avaliação facial':'PROC-001','Limpeza de pele':'PROC-002','Bioestimulador':'PROC-003','Laser':'PROC-004','Peeling':'PROC-005'};

 function procedureCode(item){
  if(item.procedureCode)return item.procedureCode;
  if(procedures[item.procedure])return procedures[item.procedure];
  const matches=read('poc-procedimentos-adicionais',[]).filter(p=>p.name===item.procedure);
  return matches.length===1?matches[0].code:'';
 }
 function stockState(){const state=read(stockKey,null);return state&&Array.isArray(state.produtos)&&Array.isArray(state.lotes)?{...state,movimentacoes:Array.isArray(state.movimentacoes)?state.movimentacoes:[],fornecedores:Array.isArray(state.fornecedores)?state.fornecedores:[]}:{produtos:[],lotes:[],movimentacoes:[],fornecedores:[]}}
 function reservationState(){const rows=read(reservationKey,[]);return Array.isArray(rows)?rows:[]}
 function reservedQuantity(lotId,exceptIds=[]){return reservationState().filter(row=>row.lotId===lotId&&!exceptIds.includes(row.id)).reduce((total,row)=>total+Number(row.quantity||0),0)}
 function entryRows(state,lot){return state.movimentacoes.filter(m=>m.lote_id===lot.id&&m.tipo==='ENTRADA'&&!m.estornado)}
 function lotManufacturer(state,lot,entries){
  const names=[...new Set([lot.fabricante_snapshot,...entries.map(m=>m.fabricante_snapshot)].filter(Boolean).map(x=>String(x).trim()))];
  return names.length>1?'Fabricantes divergentes':names[0]||state.produtos.find(p=>p.id===lot.produto_id)?.fabricante||'Não informado';
 }
 function lotSources(state,entries){
  const sources=[...new Set(entries.map(m=>[m.fornecedor_snapshot,m.documento].filter(Boolean).join(' · ')).filter(Boolean))];
  return sources.length?sources.join(' | '):'Sem nota de entrada registrada';
 }
 function availableLots(state,exceptIds=[]){
  const today=new Date();today.setHours(0,0,0,0);
  return state.lotes.filter(l=>Number(l.quantidade_atual)-reservedQuantity(l.id,exceptIds)>0&&l.data_validade&&new Date(l.data_validade+'T00:00:00')>=today)
   .map(l=>{const product=state.produtos.find(p=>p.id===l.produto_id),entries=entryRows(state,l);return product?{product,lot:l,entries,manufacturer:lotManufacturer(state,l,entries),sources:lotSources(state,entries),availableQuantity:Number(l.quantidade_atual)-reservedQuantity(l.id,exceptIds)}:null})
   .filter(Boolean).sort((a,b)=>a.lot.data_validade.localeCompare(b.lot.data_validade));
 }
 function patientMaterialSeed(id,state){
  if(id!=='exemplo-prontuario')return [];
  const stock=availableLots(state);
  const showcaseLots=stock.filter(x=>['exemplo-ah-alfa','exemplo-ah-beta'].includes(x.lot.id));
  const selected=showcaseLots.length?showcaseLots:stock.slice(0,1);
  return selected.map(row=>({
   name:productLabel(row.product.nome_comercial),suggested:1,quantity:1,unit:row.product.unidade_medida||'un',reservationId:'showcase-'+row.lot.id,
   productId:row.product.id,productName:productLabel(row.product.nome_comercial),lotId:row.lot.id,
   lot:row.lot.numero_lote,expiry:row.lot.data_validade,manufacturer:row.manufacturer,
   source:row.sources,anvisa:row.product.registro_anvisa||row.product.numero_registro_anvisa||'',label:''
  }));
 }
 function materialFromKit(kit,state){
  const lots=availableLots(state);
  return kit.map(item=>{
   const candidates=lots.filter(x=>item.productId?x.product.id===item.productId:norm(productLabel(x.product.nome_comercial))===norm(productLabel(item.name))&&norm(x.product.unidade_medida)===norm(item.unit));
   const match=candidates[0]||null;
   return {name:String(item.name||''),suggested:item.quantity,quantity:item.quantity,unit:String(item.unit||''),productId:match?.product.id||'',productName:match?.product.nome_comercial||'',lotId:match?.lot.id||'',lot:match?.lot.numero_lote||'',expiry:match?.lot.data_validade||'',manufacturer:match?.manufacturer||'',source:match?.sources||'',anvisa:match?.product.registro_anvisa||'',label:''};
  });
 }

 window.PocMaterials={render(form,id,appointment){
  const isShowcase=id==='exemplo-prontuario',item=appointment||(isShowcase?{procedure:'Avaliação facial',procedureCode:'PROC-001',doctor:'Dra. Helena',status:'Em atendimento'}:null);
  if(!item){form.innerHTML='<h3>Materiais utilizados</h3><p>Atendimento não encontrado.</p>';return}
  const code=procedureCode(item),key='poc-materiais-atendimento:'+id,draftKey='poc-materiais-rascunho:'+id,state=stockState(),kits=read('poc-procedure-kits',{}),kit=Array.isArray(kits[code])?kits[code]:[],stored=read(key,null),savedMaterials=Array.isArray(stored?.materials)?stored.materials:null,draft=read(draftKey,null);
  const needsLotRefresh=isShowcase&&savedMaterials?.length&&savedMaterials.some(x=>!x.lotId||!state.lotes.some(lot=>lot.id===x.lotId&&lot.produto_id===x.productId));
  let materials=Array.isArray(draft?.materials)?draft.materials.map(x=>({...x})):savedMaterials&&!needsLotRefresh?savedMaterials.map(x=>({...x})):isShowcase?patientMaterialSeed(id,state):[],editing=null,refreshSearchOptions=null,refreshKitPreview=null,storageWatcher=null;
  function storeDraft(){try{localStorage.setItem(draftKey,JSON.stringify({appointmentId:id,patientId:item.patientId||null,professional:item.doctor||'',materials,updatedAt:new Date().toISOString()}));return true}catch{return false}}
  function ensureReservations(){
   const rows=reservationState(),current=stockState();let changed=false;
   for(const material of materials){
    if(!material.lotId||!material.productId||!Number(material.quantity))continue;
    if(rows.some(row=>row.id===material.reservationId&&row.status==='active'))continue;
    const lot=current.lotes.find(entry=>entry.id===material.lotId&&entry.produto_id===material.productId);if(!lot)continue;
    const free=Number(lot.quantidade_atual)-rows.filter(row=>row.lotId===lot.id&&row.status==='active').reduce((total,row)=>total+Number(row.quantity||0),0);
    if(Number(material.quantity)>free){material.reservationConflict=true;continue}
    material.reservationId=material.reservationId||makeId();material.reservationConflict=false;
    rows.push({id:material.reservationId,lotId:lot.id,productId:lot.produto_id,quantity:Number(material.quantity),appointmentId:id,professional:item.doctor||'',createdAt:new Date().toISOString(),status:'active'});changed=true;
   }
   if(changed){try{localStorage.setItem(reservationKey,JSON.stringify(rows))}catch{}}
   if(!draft&&materials.length)storeDraft();
  }
  ensureReservations();
  const readonly=['Atendimento finalizado','Concluído'].includes(item.status)||new URLSearchParams(location.search).get('modo')==='leitura';
  const refreshed=()=>stockState();
  function availability(material,stateNow){
   const lot=stateNow.lotes.find(x=>x.id===material.lotId),product=stateNow.produtos.find(x=>x.id===material.productId);
   if(!lot||!product||Number(material.quantity)<=0)return false;
   const today=new Date();today.setHours(0,0,0,0);
   const free=Number(lot.quantidade_atual)-reservedQuantity(lot.id,[material.reservationId].filter(Boolean));
   return !material.reservationConflict&&Number(material.quantity)<=free&&new Date(lot.data_validade+'T00:00:00')>=today;
  }
  async function reserveRows(rows,replacingIds=[]){
   const transact=()=>{
    const current=stockState(),held=reservationState().filter(row=>!replacingIds.includes(row.id)&&row.status==='active'),requested={};
    for(const row of rows){
     const lot=current.lotes.find(entry=>entry.id===row.lotId&&entry.produto_id===row.productId),quantity=Number(row.quantity);
     if(!lot||!Number.isFinite(quantity)||quantity<=0)return false;
     const available=Number(lot.quantidade_atual)-held.filter(entry=>entry.lotId===lot.id).reduce((sum,entry)=>sum+Number(entry.quantity||0),0)-(requested[lot.id]||0);
     const today=new Date();today.setHours(0,0,0,0);
     if(quantity>available||!lot.data_validade||new Date(lot.data_validade+'T00:00:00')<today)return false;
     requested[lot.id]=(requested[lot.id]||0)+quantity;
    }
    const next=held.slice();
    for(const row of rows){row.reservationId=makeId();row.reservationConflict=false;next.push({id:row.reservationId,lotId:row.lotId,productId:row.productId,quantity:Number(row.quantity),appointmentId:id,professional:item.doctor||'',createdAt:new Date().toISOString(),status:'active'})}
    try{localStorage.setItem(reservationKey,JSON.stringify(next));return true}catch{return false}
   };
   try{return navigator.locks?.request?await navigator.locks.request('poc-reserva-de-estoque',transact):transact()}catch{return false}
  }
  async function releaseRows(rows){
   const ids=rows.map(row=>row.reservationId).filter(Boolean),transact=()=>{try{localStorage.setItem(reservationKey,JSON.stringify(reservationState().filter(row=>!ids.includes(row.id))));return true}catch{return false}};
   try{return navigator.locks?.request?await navigator.locks.request('poc-reserva-de-estoque',transact):transact()}catch{return false}
  }
  function reserveInitialization(rows){
   if(!rows.length)return;
   const current=reservationState(),known=new Set(current.map(row=>row.id));
   for(const row of rows){if(!row.reservationId||known.has(row.reservationId))continue;const lot=state.lotes.find(entry=>entry.id===row.lotId);if(!lot)continue;current.push({id:row.reservationId,lotId:row.lotId,productId:row.productId,quantity:Number(row.quantity),appointmentId:id,professional:item.doctor||'',createdAt:new Date().toISOString(),status:'active'});known.add(row.reservationId)}
   try{localStorage.setItem(reservationKey,JSON.stringify(current))}catch{}
  }
  function draw(){
   const current=refreshed(),canEdit=!readonly;
   const rows=materials.map((m,index)=>{
    const product=current.produtos.find(p=>p.id===m.productId),ok=availability(m,current);
    return `<tr>
     <td data-label="Produto"><strong>${esc(m.productName||productLabel(product?.nome_comercial)||m.name||'Não informado')}</strong><small>${esc(product?.codigo_sku||'')}</small></td>
     <td data-label="Quantidade">${esc(m.quantity??'—')} ${esc(m.unit||product?.unidade_medida||'')}</td>
     <td data-label="Fabricante">${esc(m.manufacturer||'—')}</td>
     <td data-label="Lote">${esc(m.lot||'—')}</td>
     <td data-label="Validade">${esc(fmtDate(m.expiry))}</td>
     <td data-label="Entrada / nota">${esc(m.source||'—')}</td>
     <td data-label="Registro sanitário">${esc(m.anvisa||'—')}</td>
     <td data-label="Etiqueta">${esc(m.label||'—')}</td>
     <td data-label="Disponibilidade"><span class="material-stock-state ${ok?'is-available':'is-unavailable'}">${readonly?'Registro salvo':ok?'Disponível':'Conferir estoque'}</span></td>
     ${canEdit?`<td data-label="Ações"><div class="materials-actions"><button type="button" class="button secondary material-action-icon" data-edit-material="${index}" title="Editar material" aria-label="Editar ${esc(m.productName||m.name||'material')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/></svg></button><button type="button" class="button secondary material-action-icon" data-delete-material="${index}" title="Excluir material" aria-label="Excluir ${esc(m.productName||m.name||'material')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 3h4M7 7l1 13h8l1-13M10 11v6m4-6v6"/></svg></button></div></td>`:''}
    </tr>`;
   }).join('');
   form.innerHTML=`<div class="clinical-record-heading"><h3>Materiais utilizados</h3>${canEdit?'<button type="button" class="button" id="material-add-top">Adicionar material</button>':''}</div>
    <div id="materials-list"><div class="materials-table-wrap"><table class="materials-table"><thead><tr><th>Produto</th><th>Quantidade</th><th>Fabricante</th><th>Lote</th><th>Validade</th><th>Entrada / nota</th><th>Registro sanitário</th><th>Etiqueta</th><th>Disponibilidade</th>${canEdit?'<th>Ações</th>':''}</tr></thead><tbody>${rows}</tbody></table></div></div>
    ${canEdit?`<p class="small muted material-stock-note">Ao adicionar à lista, a quantidade fica reservada para este atendimento. Excluir o item libera o saldo para outra pessoa.</p><div class="form-actions"><button type="submit" class="button">Salvar materiais utilizados</button></div><dialog id="material-editor"><div class="material-editor-content"></div></dialog>`:'<p class="small muted">Atendimento finalizado: materiais disponíveis apenas para consulta.</p>'}
    <p id="material-feedback" role="status" aria-live="polite"></p>`;
   if(!canEdit)return;
   form.querySelector('#material-add-top').onclick=()=>openEditor(null);
   form.querySelectorAll('[data-edit-material]').forEach(button=>button.onclick=()=>openEditor(Number(button.dataset.editMaterial)));
   form.querySelectorAll('[data-delete-material]').forEach(button=>button.onclick=async()=>{const index=Number(button.dataset.deleteMaterial);if(!confirm('Excluir este material da lista e liberar a quantidade reservada?'))return;const [removed]=materials.splice(index,1);if(!storeDraft()){materials.splice(index,0,removed);draw();form.querySelector('#material-feedback').textContent='Não foi possível salvar a alteração da lista. A reserva continua ativa.';return}if(!await releaseRows([removed])){materials.splice(index,0,removed);storeDraft();draw();form.querySelector('#material-feedback').textContent='Não foi possível liberar a reserva. Tente novamente.';return}draw();form.querySelector('#material-feedback').textContent='Material removido e saldo liberado para outros atendimentos.'});
   if(storageWatcher)window.removeEventListener('storage',storageWatcher);
   storageWatcher=event=>{if(event.key===reservationKey||event.key===stockKey){if(form.querySelector('#material-editor')?.open){refreshSearchOptions?.();refreshKitPreview?.()}else draw()}};
   window.addEventListener('storage',storageWatcher);
  }
  function openEditor(index){
   editing=index;
   const original=index==null?{name:'',quantity:'',productId:'',productName:'',lotId:'',unit:'',lot:'',expiry:'',manufacturer:'',source:'',anvisa:'',label:''}:materials[index];
   const dialog=form.querySelector('#material-editor'),content=dialog.querySelector('.material-editor-content');
   content.innerHTML=`<h3>${index==null?'Adicionar material':'Editar material'}</h3>
    <div class="material-search-modes" role="group" aria-label="Como adicionar materiais"><button type="button" class="button secondary" data-material-mode="individual" aria-pressed="true">Pesquisar material</button><button type="button" class="button secondary" data-material-mode="kit" aria-pressed="false">Pesquisar kit</button></div>
    <section class="material-mode-panel" data-material-panel="individual"><div class="material-grid">
     <div class="material-product-search material-editor-wide"><label for="material-product-search">Produto, fabricante, lote ou nota de entrada</label><input id="material-product-search" type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="material-product-options" autocomplete="off" placeholder="Pesquise produto, fabricante, lote, fornecedor ou nota" value=""><input type="hidden" name="productId" value="${esc(original.productId||'')}"><input type="hidden" name="lotId" value="${esc(original.lotId||'')}"><ul id="material-product-options" role="listbox" hidden></ul><p id="material-product-help" class="small muted" role="status">Selecione o lote que será utilizado. Os resultados mostram saldo, validade e documentos de entrada.</p></div>
     <label>Quantidade utilizada<input name="quantity" type="number" min="0.01" step="any" value="${esc(original.quantity??'')}"></label>
     <label>Fabricante<input name="manufacturer" value="${esc(original.manufacturer||'')}" readonly></label>
     <label>Lote<input name="lot" value="${esc(original.lot||'')}" readonly></label>
     <label>Validade<input name="expiry" type="date" value="${esc(original.expiry||'')}" readonly></label>
     <label class="material-editor-wide">Fornecedor / documento de entrada<input name="source" value="${esc(original.source||'')}" readonly></label>
    </div></section>
    <section class="material-mode-panel" data-material-panel="kit" hidden><h4>Kit de ${esc(item.procedure||'este procedimento')}</h4><div id="material-kit-preview"></div><p class="small muted">O sistema seleciona os lotes disponíveis pela validade mais próxima e reserva as quantidades ao adicionar o kit.</p><button type="button" class="button" id="material-kit-add">Adicionar kit à lista</button></section>
    <p id="material-editor-error" class="error-text" role="alert"></p><div class="form-actions"><button type="button" class="button secondary" id="material-editor-cancel">Cancelar</button><button type="button" class="button" id="material-editor-apply">${index==null?'Adicionar à lista':'Aplicar alterações'}</button></div>`;
   const stateNow=refreshed(),search=content.querySelector('#material-product-search'),productHidden=content.querySelector('[name=productId]'),lotHidden=content.querySelector('[name=lotId]'),options=content.querySelector('#material-product-options'),help=content.querySelector('#material-product-help'),modeButtons=[...content.querySelectorAll('[data-material-mode]')],modePanels=[...content.querySelectorAll('[data-material-panel]')],kitAdd=content.querySelector('#material-kit-add');
   let matches=[],highlight=0;
   function close(){options.hidden=true;search.setAttribute('aria-expanded','false');search.removeAttribute('aria-activedescendant')}
   function choose(row){
    productHidden.value=row.product.id;lotHidden.value=row.lot.id;
    search.value=`${productLabel(row.product.nome_comercial)} · ${row.manufacturer} · ${row.lot.numero_lote}`;
    content.querySelector('[name=manufacturer]').value=row.manufacturer;
    content.querySelector('[name=lot]').value=row.lot.numero_lote;
    content.querySelector('[name=expiry]').value=row.lot.data_validade;
    content.querySelector('[name=source]').value=row.sources;
    content.querySelector('[name=quantity]').max=String(row.availableQuantity);
    content.querySelector('[name=quantity]').value=original.quantity&&original.lotId===row.lot.id?original.quantity:'';
    help.textContent=`Disponível para este atendimento: ${row.availableQuantity} ${row.product.unidade_medida||'un'} · validade ${fmtDate(row.lot.data_validade)}`;
    close();content.querySelector('[name=quantity]').focus();
   }
   function suggest(){
    const query=norm(search.value),rows=availableLots(refreshed(),[original.reservationId].filter(Boolean)).filter(row=>{
     const text=[row.product.nome_comercial,row.product.codigo_sku,row.product.categoria_id,row.manufacturer,row.lot.numero_lote,row.lot.data_validade,row.sources,...row.entries.map(m=>m.fornecedor_snapshot),...row.entries.map(m=>m.documento)].join(' ');
     return !query||norm(text).includes(query);
    });
    matches=rows.slice(0,20);highlight=Math.max(0,Math.min(highlight,matches.length-1));options.replaceChildren();
    matches.forEach((row,index)=>{
     const option=document.createElement('li');option.id='material-product-option-'+index;option.setAttribute('role','option');option.setAttribute('aria-selected',String(index===highlight));option.dataset.index=String(index);
     const title=document.createElement('strong'),detail=document.createElement('small'),source=document.createElement('small');
     title.textContent=productLabel(row.product.nome_comercial)+' · '+row.product.codigo_sku;
     detail.textContent=`${row.manufacturer} · Lote ${row.lot.numero_lote} · vence ${fmtDate(row.lot.data_validade)} · saldo ${row.lot.quantidade_atual} ${row.product.unidade_medida||'un'}`;
     source.textContent=row.sources;option.append(title,detail,source);options.append(option);
    });
    const total=availableLots(refreshed(),[original.reservationId].filter(Boolean)).filter(row=>{const text=[row.product.nome_comercial,row.product.codigo_sku,row.product.categoria_id,row.manufacturer,row.lot.numero_lote,row.lot.data_validade,row.sources,...row.entries.map(m=>m.fornecedor_snapshot),...row.entries.map(m=>m.documento)].join(' ');return !query||norm(text).includes(query)}).length;
    if(!matches.length)help.textContent='Nenhum lote disponível corresponde à pesquisa.';else help.textContent=total>20?'Mostrando 20 lotes. Digite mais para refinar.':'Selecione um lote; a validade mais próxima aparece primeiro.';
    options.hidden=!matches.length;search.setAttribute('aria-expanded',String(matches.length>0));if(matches.length)search.setAttribute('aria-activedescendant','material-product-option-'+highlight);else search.removeAttribute('aria-activedescendant');
   }
   if(index!==null)content.querySelector('[data-material-mode="kit"]').hidden=true;
   function allocateKit(){
    const candidates=availableLots(refreshed(),[original.reservationId].filter(Boolean)),remaining=new Map(candidates.map(row=>[row.lot.id,row.availableQuantity])),allocated=[];
    for(const kitItem of kit){let quantity=Number(kitItem.quantity),matchesForItem=candidates.filter(row=>kitItem.productId?row.product.id===kitItem.productId:norm(productLabel(row.product.nome_comercial))===norm(productLabel(kitItem.name))&&norm(row.product.unidade_medida)===norm(kitItem.unit));
     for(const row of matchesForItem){const available=remaining.get(row.lot.id)||0;if(available<=0)continue;const portion=Math.min(quantity,available);allocated.push({name:productLabel(row.product.nome_comercial),productName:productLabel(row.product.nome_comercial),productId:row.product.id,lotId:row.lot.id,unit:row.product.unidade_medida||'',quantity:portion,suggested:kitItem.quantity,manufacturer:row.manufacturer,lot:row.lot.numero_lote,expiry:row.lot.data_validade,source:row.sources,anvisa:row.product.registro_anvisa||row.product.numero_registro_anvisa||'',label:''});quantity-=portion;remaining.set(row.lot.id,available-portion);if(quantity<=0)break}
     if(quantity>0)return {rows:[],error:`Saldo insuficiente para ${kitItem.name}. Ajuste o kit ou reponha o material antes de incluí-lo.`};
    }
    return {rows:allocated,error:''};
   }
   function showKit(){const panel=content.querySelector('#material-kit-preview');if(!kit.length){panel.innerHTML='<p class="small muted">Este procedimento ainda não tem materiais cadastrados no kit. Cadastre os itens em Procedimentos → Kit.</p>';kitAdd.disabled=true;return}const allocation=allocateKit();panel.innerHTML=`<div class="material-kit-preview-list">${kit.map(line=>`<div><strong>${esc(line.name)}</strong><span>${esc(line.quantity)} ${esc(line.unit)}</span></div>`).join('')}</div>${allocation.error?`<p class="error-text" role="alert">${esc(allocation.error)}</p>`:`<p class="small muted">${allocation.rows.length} linha(s) de lote serão reservadas pela validade mais próxima.</p>`}`;kitAdd.disabled=Boolean(allocation.error)}
   refreshKitPreview=showKit;
   modeButtons.forEach(button=>button.onclick=()=>{const mode=button.dataset.materialMode;modeButtons.forEach(entry=>entry.setAttribute('aria-pressed',String(entry===button)));modePanels.forEach(panel=>panel.hidden=panel.dataset.materialPanel!==mode);content.querySelector('#material-editor-error').textContent='';content.querySelector('#material-editor-apply').hidden=mode==='kit';kitAdd.hidden=mode!=='kit';if(mode==='kit')showKit();else search.focus()});
   if(original.lotId){const match=availableLots(stateNow,[original.reservationId].filter(Boolean)).find(row=>row.lot.id===original.lotId&&row.product.id===original.productId);if(match)search.value=`${productLabel(match.product.nome_comercial)} · ${match.manufacturer} · ${match.lot.numero_lote}`;}
   kitAdd.hidden=true;dialog.showModal();search.oninput=()=>{productHidden.value='';lotHidden.value='';highlight=0;suggest()};search.onfocus=suggest;
   search.onkeydown=event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();highlight=Math.max(0,Math.min(matches.length-1,highlight+(event.key==='ArrowDown'?1:-1)));suggest()}else if(event.key==='Enter'&&!options.hidden){event.preventDefault();if(matches[highlight])choose(matches[highlight])}else if(event.key==='Escape'&&!options.hidden){event.preventDefault();event.stopPropagation();close()}};
   options.onmousedown=event=>event.preventDefault();options.onclick=event=>{const option=event.target.closest('[data-index]');if(option&&matches[Number(option.dataset.index)])choose(matches[Number(option.dataset.index)])};search.onblur=()=>setTimeout(close,150);
   content.querySelector('#material-editor-cancel').onclick=()=>dialog.close();
   refreshSearchOptions=suggest;
   kitAdd.onclick=async()=>{const allocation=allocateKit(),error=content.querySelector('#material-editor-error');if(allocation.error){error.textContent=allocation.error;return}if(!allocation.rows.length){error.textContent='O kit não tem itens associados a produtos disponíveis.';return}if(!await reserveRows(allocation.rows)){error.textContent='Outro profissional reservou um dos lotes primeiro. Atualize a busca do kit e tente novamente.';showKit();return}materials.push(...allocation.rows);storeDraft();dialog.close();draw();form.querySelector('#material-feedback').textContent='Materiais do kit adicionados e reservados para este atendimento.'};
   content.querySelector('#material-editor-apply').onclick=async()=>{
    const current=refreshed(),lot=current.lotes.find(row=>row.id===lotHidden.value),product=current.produtos.find(row=>row.id===productHidden.value),quantity=Number(content.querySelector('[name=quantity]').value),error=content.querySelector('#material-editor-error');
    if(!lot||!product||lot.produto_id!==product.id||!Number.isFinite(quantity)||quantity<=0||new Date(lot.data_validade+'T00:00:00')<new Date(new Date().setHours(0,0,0,0))){error.textContent='Selecione um lote disponível e informe uma quantidade dentro do saldo e da validade.';return}
    const source=lotSources(current,entryRows(current,lot)),updated={...original,name:productLabel(product.nome_comercial),productId:product.id,productName:productLabel(product.nome_comercial),lotId:lot.id,unit:product.unidade_medida||'',quantity,manufacturer:lotManufacturer(current,lot,entryRows(current,lot)),lot:lot.numero_lote,expiry:lot.data_validade,source,anvisa:original.anvisa||product.registro_anvisa||product.numero_registro_anvisa||'',label:original.label||''};
    if(!await reserveRows([updated],[original.reservationId].filter(Boolean))){error.textContent='Outro profissional reservou este lote primeiro ou o saldo já não é suficiente. Escolha outro lote.';search.value='';productHidden.value='';lotHidden.value='';suggest();return}
    if(editing==null)materials.push(updated);else materials[editing]=updated;
    storeDraft();dialog.close();draw();form.querySelector('#material-feedback').textContent='Material adicionado e reservado para este atendimento.';
   };
  }
  form.onsubmit=event=>{
   event.preventDefault();if(readonly)return;const current=refreshed(),totals={};
   const activeReservations=new Set(reservationState().map(row=>row.id));
   for(const material of materials){const lot=current.lotes.find(x=>x.id===material.lotId),product=current.produtos.find(x=>x.id===material.productId),quantity=Number(material.quantity);if(!lot||!product||lot.produto_id!==product.id||!Number.isFinite(quantity)||quantity<=0||!material.reservationId||!activeReservations.has(material.reservationId)||!availability(material,current)){form.querySelector('#material-feedback').textContent='Um dos lotes não está mais reservado ou disponível para este atendimento. Remova e selecione o material novamente.';return}totals[lot.id]=(totals[lot.id]||0)+quantity;if(totals[lot.id]>Number(lot.quantidade_atual)){form.querySelector('#material-feedback').textContent='A quantidade informada excede o saldo do lote. Selecione outro lote ou ajuste a quantidade.';return}}
   try{localStorage.setItem(key,JSON.stringify({procedureCode:code,procedure:item.procedure,patientId:item.patientId||null,appointmentId:id,professional:item.doctor||'',materials:materials.map(material=>({...material,quantity:Number(material.quantity)})),savedAt:new Date().toISOString()}));localStorage.removeItem(draftKey);form.querySelector('#material-feedback').textContent='Materiais salvos neste navegador. As quantidades continuam reservadas até serem removidas da lista.'}
   catch{form.querySelector('#material-feedback').textContent='Não foi possível salvar os materiais neste navegador.'}
  };
  draw();
 }};

 const params=new URLSearchParams(location.search),visitId=params.get('atendimento'),root=document.getElementById('page-content');
 root?.querySelector('#finish-visit')?.addEventListener('click',event=>{
  const visits=read('agenda-items',[]),visit=Array.isArray(visits)?visits.find(x=>x.appointmentId===visitId):null;if(!visit)return;
  const code=procedureCode(visit),kit=read('poc-procedure-kits',{})[code];if(!Array.isArray(kit)||!kit.length)return;
  const saved=read('poc-materiais-atendimento:'+visitId,null),draft=read('poc-materiais-rascunho:'+visitId,null),state=stockState(),items=Array.isArray(saved?.materials)?saved.materials:[],totals={};let valid=Boolean(saved&&Array.isArray(saved.materials)&&!draft);
  const activeReservations=new Set(reservationState().map(row=>row.id));
  for(const material of items){const lot=state.lotes.find(x=>x.id===material.lotId),product=state.produtos.find(x=>x.id===material.productId),quantity=Number(material.quantity);if(!lot||!product||lot.produto_id!==product.id||!Number.isFinite(quantity)||quantity<=0||!material.reservationId||!activeReservations.has(material.reservationId)){valid=false;break}totals[lot.id]=(totals[lot.id]||0)+quantity;if(totals[lot.id]>Number(lot.quantidade_atual)){valid=false;break}}
  if(!valid){event.preventDefault();event.stopImmediatePropagation();root.querySelector('[data-section="materiais"]')?.click();const feedback=root.querySelector('#material-feedback');if(feedback)feedback.textContent='Confira e salve os materiais com lotes disponíveis no estoque antes de finalizar.'}
 },true);
})();
