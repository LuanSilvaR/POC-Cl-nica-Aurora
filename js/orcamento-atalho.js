(()=>{'use strict';const params=new URLSearchParams(location.search);if(params.get('secao')!=='orcamento')return;const tab=document.querySelector('[data-section="orcamento"]');if(tab)tab.click()})();
