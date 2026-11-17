(()=>{
 const params=new URLSearchParams(location.search);if(params.get('modo')!=='leitura')return;
 const root=document.getElementById('page-content'),id=params.get('atendimento');let items=[];try{items=JSON.parse(localStorage.getItem('agenda-items')||'[]')}catch{}const item=items.find(x=>x.appointmentId===id);if(!root||!item||!['Atendimento finalizado','Concluído'].includes(item.status))return;
 const notice=document.createElement('p');notice.className='notice';notice.textContent='Atendimento finalizado — consulta em modo de leitura.';root.querySelector('.page-heading')?.after(notice);
 function lock(){root.querySelectorAll('#clinical-form input,#clinical-form textarea,#clinical-form select,#clinical-form button,.clinical-section-form input,.clinical-section-form textarea,.clinical-section-form select,.clinical-section-form button').forEach(el=>{if(el.closest('.photo-compare-section')||el.closest('[data-budget-ready]'))return;if(!el.disabled)el.disabled=true})}
 new MutationObserver(lock).observe(root,{childList:true,subtree:true});lock();
})();
