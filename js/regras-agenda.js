// Regras locais de demonstração; não substituem jornada e disponibilidade do servidor.
(() => {
 const defaults=[{name:'Avaliação facial',duration:45},{name:'Limpeza de pele',duration:60},{name:'Bioestimulador',duration:90},{name:'Laser',duration:30},{name:'Peeling',duration:45}];
 const min=s=>Number(s.slice(0,2))*60+Number(s.slice(3));
 const overlaps=(a,b,c,d)=>a<d&&c<b;
 const ranges=(doctor,date,items,blocks,exclude)=>[...items.flatMap((a,i)=>i!==exclude&&a.status!=='Cancelado'&&a.doctor===doctor&&a.date===date?[{start:min(a.time),end:min(a.time)+Number(a.duration),kind:'occupied'}]:[]),...blocks.filter(b=>b.doctor===doctor&&b.date===date).map(b=>({start:min(b.start),end:min(b.end),kind:'blocked',reason:b.reason||'Compromisso'}))];
 function full(doctor,date,items,blocks,exclude){const ordered=ranges(doctor,date,items,blocks,exclude).sort((a,b)=>a.start-b.start);let cursor=480;for(const r of ordered){if(r.end<=cursor)continue;if(r.start>cursor)return false;cursor=Math.max(cursor,r.end);if(cursor>=1080)return true;}return false;}
 function procedures(){let additional=[];try{const saved=JSON.parse(localStorage.getItem('poc-procedimentos-adicionais')||'[]');if(Array.isArray(saved))additional=saved.filter(p=>p.status==='Ativo'&&p.name&&Number.isInteger(Number(p.duration))&&Number(p.duration)>=5).map(p=>({name:p.name,duration:Number(p.duration),code:p.code}))}catch{}return [...defaults.map((p,i)=>({...p,code:'PROC-'+String(i+1).padStart(3,'0')})),...additional];}
 window.AgendaRules={procedures,ranges,overlaps,full,min};
})();
