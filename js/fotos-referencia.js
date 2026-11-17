(()=>{
 'use strict';const body=document.getElementById('clinical-section-body');if(!body)return;
 function update(){const region=body.querySelector('#photo-region')?.value,guide=body.querySelector('#photo-guide-container');if(!guide||!region)return;guide.querySelectorAll('.photo-guide figure').forEach((figure,index)=>{const svg=figure.querySelector('svg');if(!svg)return;const picture=document.createElement('div');picture.className='photo-reference-image '+(region==='Facial'?'reference-facial':'reference-corporal')+' '+(index?'reference-profile':'reference-front');picture.setAttribute('role','img');picture.setAttribute('aria-label',`Exemplo de enquadramento ${region.toLowerCase()} ${index?'de perfil':'de frente'}`);svg.replaceWith(picture)})}
 new MutationObserver(update).observe(body,{childList:true,subtree:true});update();
})();
