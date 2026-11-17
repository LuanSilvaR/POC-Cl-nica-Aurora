// Papéis da paleta da POC. A matemática OKLCh da rampa vem do legado (MIT).
(() => {
  const contrast=(a,b)=>{const l=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);return (Math.max(l(a),l(b))+.05)/(Math.min(l(a),l(b))+.05);};
  const mix=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*t+parseInt(b.slice(i,i+2),16)*(1-t)).toString(16).padStart(2,'0')).join('');
  const foreground=bg=>contrast(bg,'#ffffff')>=contrast(bg,'#000000')?'#ffffff':'#000000';
  function derive(seed,dark=false){
    const ramp=window.LegacyRamp.rampaDeSemente(seed),surface=dark?'#1d1c17':'#fcfdfc',bg=dark?'#161510':'#f3f5f4';
    seed=ramp[6];const soft=dark?mix(ramp[4],surface,.16):ramp[1];
    const candidates=ramp.map((hex,i)=>({hex,distance:Math.abs(i-(dark?4:6))})).sort((a,b)=>a.distance-b.distance);
    const text=candidates.find(({hex})=>[soft,surface,bg].every(background=>contrast(hex,background)>=4.5))?.hex||foreground(soft);
    const hover=ramp[dark?5:7],onPrimary=foreground(seed),onHover=foreground(hover);
    const vars={'--brand-seed':seed,'--primary':seed,'--on-primary':onPrimary,'--primary-hover':hover,'--on-primary-hover':onHover,'--brand-soft':soft,'--brand-text':text,'--brand-ring':text,'--link':text};
    window.LegacyRamp.GRAUS.forEach((step,i)=>vars['--brand-'+step]=ramp[i]);
    return {vars,ramp,contrasts:{button:contrast(seed,onPrimary),link:Math.min(...[soft,surface,bg].map(b=>contrast(text,b))),hover:contrast(hover,onHover)}};
  }
  function apply(seed,dark){const p=derive(seed,dark);for(const [key,value] of Object.entries(p.vars))if(document.documentElement.style.getPropertyValue(key)!==value)document.documentElement.style.setProperty(key,value);return p;}
  window.BrandPalette={derive,apply,contrast};
})();
