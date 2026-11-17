(() => {
 'use strict';
 // Preços são armazenados em centavos para evitar divergências de arredondamento.
 function parse(raw){if(String(raw).trim()===''||!/^\d+(?:[.,]\d{1,2})?$/.test(String(raw).trim()))return null;const [whole,fraction='']=String(raw).trim().replace(',','.').split('.');const n=Number(whole)*100+Number((fraction+'00').slice(0,2));return Number.isSafeInteger(n)?n:null}
 function valid(item){return Number.isInteger(item.quantity)&&item.quantity>=1&&item.quantity<=999&&Number.isSafeInteger(item.baseUnit)&&item.baseUnit>0&&Number.isSafeInteger(item.packageUnit)&&item.packageUnit>=0&&item.packageUnit<=item.baseUnit}
 window.PocCatalogPrices={parse,valid};
})();
