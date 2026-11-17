(()=>{
 'use strict';
 const selectors='.patient-timeline-table,.agenda-history-table,.admin-table,.permission-table,.data-table,.materials-table,.access-table';
 const materialState=new Map();
 function prepare(table){
  if(table.dataset.paginationReady)return;
  const body=table.tBodies[0];if(!body)return;
  table.dataset.paginationReady='true';const key=table.closest('#materials-list')?'prontuario':table.closest('#procedure-kit-list')?'kit':null;const state=key?(materialState.get(key)||{page:1,size:25,active:-1,direction:1}):{page:1,size:25,active:-1,direction:1};if(key)materialState.set(key,state);let page=state.page,size=state.size;
  const nav=document.createElement('nav');nav.className='table-pagination';nav.setAttribute('aria-label','Paginação da tabela');
  nav.innerHTML='<label class="page-size-control">Itens por página<select aria-label="Itens por página"><option>25</option><option>50</option><option>100</option></select></label><button type="button" class="button secondary" data-page="previous">Anterior</button><span aria-live="polite"></span><button type="button" class="button secondary" data-page="next">Próxima</button>';
  table.parentElement.insertAdjacentElement('afterend',nav);
  const select=nav.querySelector('select'),prev=nav.querySelector('[data-page=previous]'),next=nav.querySelector('[data-page=next]'),label=nav.querySelector('span');
  function sortRows(index,direction){const rows=[...body.rows].map((row,order)=>({row,order}));rows.sort((a,b)=>{const x=a.row.cells[index]?.textContent.trim()||'',y=b.row.cells[index]?.textContent.trim()||'',dx=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(x),dy=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(y);const result=dx&&dy?(`${dx[3]}${dx[2]}${dx[1]}`).localeCompare(`${dy[3]}${dy[2]}${dy[1]}`):x.localeCompare(y,'pt-BR',{numeric:true,sensitivity:'base'});return direction*result||a.order-b.order});rows.forEach(x=>body.append(x.row))}
  if(table.matches('.materials-table,.access-table')){[...table.tHead.rows[0].cells].forEach((th,index)=>{if(th.textContent.trim()==='Ações')return;const title=th.textContent.trim(),button=document.createElement('button');button.type='button';button.className='materials-sort';const update=()=>{button.textContent=title+(state.active===index?(state.direction===1?' ↑':' ↓'):' ↕');if(state.active===index)th.setAttribute('aria-sort',state.direction===1?'ascending':'descending');else th.setAttribute('aria-sort','none')};th.replaceChildren(button);update();button.onclick=()=>{state.direction=state.active===index?-state.direction:1;state.active=index;sortRows(index,state.direction);table.tHead.querySelectorAll('th button').forEach(b=>{const h=b.parentElement;b.textContent=b.textContent.replace(/ [↑↓↕]$/,' ↕');h.setAttribute('aria-sort','none')});update();page=1;render()}});if(state.active>=0)sortRows(state.active,state.direction)}
  select.value=String(size);
  function render(){const rows=[...body.rows],pages=Math.max(1,Math.ceil(rows.length/size));page=Math.max(1,Math.min(page,pages));state.page=page;state.size=size;rows.forEach((row,i)=>{row.hidden=i<(page-1)*size||i>=page*size});prev.disabled=page===1;next.disabled=page===pages;label.textContent=`Página ${page} de ${pages} · ${rows.length} itens`}
  select.onchange=()=>{size=Number(select.value);page=1;render()};prev.onclick=()=>{page--;render()};next.onclick=()=>{page++;render()};render();
 }
 function scan(root){if(root.nodeType!==1)return;if(root.matches(selectors))prepare(root);root.querySelectorAll(selectors).forEach(prepare)}
 document.addEventListener('DOMContentLoaded',()=>{scan(document.body);new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(scan))).observe(document.body,{childList:true,subtree:true})});
})();
