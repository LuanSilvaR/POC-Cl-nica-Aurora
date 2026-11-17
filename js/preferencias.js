// Preferências de apresentação e encerramento local da demonstração.
(() => {
  'use strict';
  // Identidade fictícia compartilhada pela saudação e pelo menu da POC.
  let accountName='Rafael Mendes';
  try{const saved=JSON.parse(localStorage.getItem('aurora-settings-conta')||'null');if(saved&&typeof saved.name==='string'&&saved.name.trim())accountName=saved.name.trim();}catch{}
  window.PocUser=Object.freeze({name:accountName,email:'rafael.mendes@clinica.example',role:'Administrador da empresa'});
  let theme='light';
  try {if(localStorage.getItem('aurora-theme')==='dark')theme='dark';}catch{}
  document.documentElement.dataset.theme=theme;
  const isExit=location.pathname.endsWith('/saida.html');
  function checkSession(){try{if(!isExit&&sessionStorage.getItem('aurora-demo-exited')==='true')location.replace('saida.html');}catch{}}
  checkSession();window.addEventListener('pageshow',checkSession);
  let seed='#176455';
  try {const saved=JSON.parse(localStorage.getItem('aurora-brand')||'null');if(saved&&/^#[a-f0-9]{6}$/i.test(saved.primary))seed=saved.primary;}catch{}
  function accessibleLink(){window.BrandPalette.apply(document.documentElement.style.getPropertyValue('--brand-seed')||seed,document.documentElement.dataset.theme==='dark');}
  accessibleLink();
  new MutationObserver(accessibleLink).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','style']});
  document.addEventListener('DOMContentLoaded',()=>{
    const host=document.querySelector('.header,.review-header,.exit-header');
    if(!host)return;
    const toolbar=document.createElement('div');toolbar.className='session-controls';toolbar.setAttribute('aria-label','Conta do usuário');
    const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
    const icons={sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',moon:'M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z',exit:'M9 4H4v16h5m6-12 5 4-5 4m-7-4h12'};
    const toggle=document.createElement('button');toggle.type='button';toggle.className='account-menu-action';
    const feedback=document.createElement('span');feedback.className='sr-only';feedback.setAttribute('role','status');
    let trigger=null,popover=null;
    const position=()=>{if(!trigger||!popover)return;const rect=trigger.getBoundingClientRect(),width=Math.min(260,innerWidth-32);popover.style.width=width+'px';popover.style.left=Math.max(16,Math.min(rect.right-width,innerWidth-width-16))+'px';popover.style.top=Math.max(8,Math.min(rect.bottom+8,innerHeight-popover.offsetHeight-8))+'px';};
    const closeMenu=(restore=true)=>{if(popover?.matches(':popover-open'))popover.hidePopover();trigger?.setAttribute('aria-expanded','false');if(restore)trigger?.focus();};
    const sync=()=>{const dark=document.documentElement.dataset.theme==='dark';toggle.innerHTML=svg(dark?icons.sun:icons.moon)+`<span>${dark?'Tema claro':'Tema escuro'}</span>`;toggle.setAttribute('aria-label',dark?'Ativar tema claro':'Ativar tema escuro');accessibleLink();};
    toggle.onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('aurora-theme',document.documentElement.dataset.theme);feedback.textContent='Tema atualizado.';}catch{feedback.textContent='Tema aplicado nesta página. Não foi possível salvar a preferência.';}sync();if(!isExit)closeMenu();};
    if(!isExit){
      trigger=document.createElement('button');trigger.type='button';trigger.className='user-menu-trigger';trigger.setAttribute('aria-label','Menu do usuário');trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-controls','user-popover');trigger.setAttribute('aria-expanded','false');trigger.title='Menu do usuário';trigger.innerHTML='<span class="user-initials" aria-hidden="true"></span>';
      trigger.firstElementChild.textContent=window.PocUser.name.split(/\s+/).slice(0,2).map(part=>part[0]).join('');
      popover=document.createElement('div');popover.id='user-popover';popover.className='user-popover';popover.setAttribute('popover','auto');popover.innerHTML='<div class="account-identity"><strong></strong><span data-account-email></span><span class="account-role"></span><small>Conta fictícia da POC</small></div><div class="account-actions" role="menu" aria-label="Ações do usuário"></div>';
      popover.querySelector('.account-identity strong').textContent=window.PocUser.name;popover.querySelector('[data-account-email]').textContent=window.PocUser.email;popover.querySelector('.account-role').textContent=window.PocUser.role;
      window.addEventListener('poc-settings-change',e=>{if(e.detail.section==='conta'){window.PocUser=Object.freeze({...window.PocUser,name:e.detail.data.name});trigger.firstElementChild.textContent=window.PocUser.name.split(/\s+/).slice(0,2).map(part=>part[0]).join('');popover.querySelector('.account-identity strong').textContent=window.PocUser.name;}});
      const menu=popover.querySelector('[role=menu]');const access=document.createElement('a');access.href='minha-seguranca.html';access.className='account-menu-action';access.setAttribute('role','menuitem');access.innerHTML=svg('M12 3 5 6v5c0 4.5 2.7 7.8 7 10 4.3-2.2 7-5.5 7-10V6zM10 12h4m-2-2v4')+'<span>Senha e acesso</span>';menu.append(access);toggle.setAttribute('role','menuitem');menu.append(toggle);
      const logout=document.createElement('button');logout.type='button';logout.className='account-menu-action';logout.setAttribute('role','menuitem');logout.setAttribute('aria-label','Sair do sistema');logout.innerHTML=svg(icons.exit)+'<span>Sair do sistema</span>';menu.append(logout);
      const items=()=>[...menu.querySelectorAll('[role=menuitem]')];
      const openMenu=(last=false)=>{popover.showPopover();position();trigger.setAttribute('aria-expanded','true');items()[last?items().length-1:0].focus();};
      trigger.onclick=()=>popover.matches(':popover-open')?closeMenu():openMenu();
      trigger.onkeydown=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();openMenu(e.key==='ArrowUp');}};
      popover.addEventListener('toggle',e=>trigger.setAttribute('aria-expanded',String(e.newState==='open')));
      popover.addEventListener('keydown',e=>{const keys=['ArrowDown','ArrowUp','Home','End'];if(keys.includes(e.key)){e.preventDefault();const list=items(),index=list.indexOf(document.activeElement);list[e.key==='Home'?0:e.key==='End'?list.length-1:(index+(e.key==='ArrowDown'?1:-1)+list.length)%list.length].focus();}if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeMenu();}if(e.key==='Tab'){closeMenu();}});
      window.addEventListener('resize',()=>{if(popover.matches(':popover-open'))position();});window.addEventListener('scroll',()=>{if(popover.matches(':popover-open'))position();},{passive:true});
      const modal=document.createElement('dialog');modal.className='exit-dialog';modal.setAttribute('aria-labelledby','exit-title');modal.innerHTML='<h2 id="exit-title">Sair do sistema?</h2><p>Você encerrará a demonstração nesta aba. Alterações de formulário não salvas serão descartadas. A identidade e o tema salvos serão preservados.</p><p class="small">Esta POC não possui autenticação real. Nenhuma sessão do CRM original será alterada.</p><div class="exit-actions"><button type="button" data-cancel-exit>Continuar no sistema</button><button type="button" data-confirm-exit>Confirmar saída</button></div>';
      document.body.append(popover,modal);logout.onclick=()=>{closeMenu(false);modal.showModal();modal.querySelector('[data-cancel-exit]').focus();};modal.querySelector('[data-cancel-exit]').onclick=()=>modal.close();modal.addEventListener('close',()=>trigger.focus());
      modal.querySelector('[data-confirm-exit]').onclick=()=>{try{sessionStorage.setItem('aurora-demo-exited','true');}catch{}location.href='saida.html';};toolbar.append(trigger,feedback);
    }else toolbar.append(toggle,feedback);
    host.append(toolbar);sync();
    if(isExit)document.getElementById('enter-demo').onclick=()=>{location.href='login.html';};
  });
})();
