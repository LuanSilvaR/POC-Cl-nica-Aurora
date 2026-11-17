// Ícones decorativos, com nomes acessíveis mantidos no texto dos botões.
(() => {
  const icons={back:'M19 12H5m6-6-6 6 6 6',save:'M5 3h12l3 3v15H4V3h1Zm3 0v6h8V3M8 21v-8h8v8',add:'M12 5v14M5 12h14',search:'M11 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm5-3 4 4',remove:'M4 7h16M10 3h4M7 7l1 13h8l1-13M10 11v6m4-6v6',close:'M6 6l12 12M18 6 6 18',edit:'m4 20 4-1 11-11-3-3L5 16l-1 4ZM14 7l3 3',send:'m3 4 18 8-18 8 3-8-3-8Zm3 8h15',refresh:'M20 7v5h-5M4 17v-5h5M6 9a7 7 0 0 1 12-2l2 2M18 15a7 7 0 0 1-12 2l-2-2',next:'M5 12h14m-6-6 6 6-6 6',check:'m5 12 4 4L19 6',info:'M12 8h.01M12 11v5m0 5a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z'};
  function kind(label){const text=label.toLocaleLowerCase('pt-BR');if(/voltar|anterior/.test(text))return 'back';if(/salvar|gravar/.test(text))return 'save';if(/adicionar|cadastrar|novo|nova|criar/.test(text))return 'add';if(/remover|excluir|apagar/.test(text))return 'remove';if(/cancelar|fechar|limpar/.test(text))return 'close';if(/restaurar|atualizar|tentar novamente/.test(text))return 'refresh';if(/editar|personalizar|revisar|conferir/.test(text))return 'edit';if(/enviar|avisar|confirmar presença/.test(text))return 'send';if(/buscar|ver |consultar|abrir análise/.test(text))return 'search';if(/confirmar|entendi|continuar|entrar/.test(text))return 'check';if(/escopo|informações/.test(text))return 'info';return 'next';}
  function decorate(root){
    const selector='button, a.button, .review-page-actions a';
    const nodes=[];if(root.nodeType===1&&root.matches(selector))nodes.push(root);if(root.querySelectorAll)nodes.push(...root.querySelectorAll(selector));
    nodes.forEach(el=>{
      if(el.dataset.actionIcon||el.querySelector('svg')||el.closest('th,.pop-toolbar')||el.matches('[role=tab],.patient-name-link,.procedure-link,.lgpd-link,.user-menu-trigger,.drawer-toggle,.drawer-close,.settings-nav button,.review-controls button,.account-menu-action,.booking-day,.booking-time,[data-week]'))return;
      const label=(el.getAttribute('aria-label')||el.textContent||'').trim();if(!label)return;
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.classList.add('action-icon');
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',icons[kind(label)]);svg.append(path);el.prepend(svg);el.dataset.actionIcon='true';el.classList.add('iconized-action');
    });
  }
  document.addEventListener('DOMContentLoaded',()=>{decorate(document.body);new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(decorate))).observe(document.body,{childList:true,subtree:true});});
})();
