const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const scope={window:{}};vm.createContext(scope);
for(const file of ['rampa-legado.js','paleta.js'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+file,'utf8'),scope);
for(const color of ['#176455','#4d3878','#bf5c15','#eeeeee','#0f172a','#ffffff','#000000'])for(const dark of [false,true]){
 const p=scope.window.BrandPalette.derive(color,dark);
 assert.equal(p.ramp.length,11);assert.equal(p.ramp[6],color);
 assert.ok(p.contrasts.button>=4.5,`${color}: botão`);assert.ok(p.contrasts.link>=4.5,`${color}: link`);assert.ok(p.contrasts.hover>=4.5,`${color}: hover`);
}
const purple=scope.window.BrandPalette.derive('#4d3878',false),orange=scope.window.BrandPalette.derive('#bf5c15',false);
assert.notEqual(purple.vars['--brand-soft'],orange.vars['--brand-soft']);
assert.notEqual(purple.vars['--primary-hover'],orange.vars['--primary-hover']);
console.log('14 combinações de cor/tema: rampa, cor literal e contrastes de botão/link/hover aprovados.');
