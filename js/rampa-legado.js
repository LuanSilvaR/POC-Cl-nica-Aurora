/* Adaptado de DeskcommCRM/lib/branding/rampa.ts. Copyright (c) 2026 Rafael Melga?o. MIT: ../third_party/DeskcommCRM-LICENSE.txt */
(()=>{
"use strict";
const GRAUS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const srgbParaLinear = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const linearParaSrgb = (c) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
function ehHexValido(hex) {
    return HEX.test(hex.trim());
}
function hexParaRgb(hex) {
    const bruto = hex.trim();
    if (!HEX.test(bruto))
        throw new TypeError(`hex inválido: ${JSON.stringify(hex)}`);
    const corpo = bruto.replace("#", "");
    const seis = corpo.length === 3
        ? corpo
            .split("")
            .map((c) => c + c)
            .join("")
        : corpo;
    return {
        r: parseInt(seis.slice(0, 2), 16),
        g: parseInt(seis.slice(2, 4), 16),
        b: parseInt(seis.slice(4, 6), 16),
    };
}
const canal = (v) => Math.max(0, Math.min(255, Math.round(v)))
    .toString(16)
    .padStart(2, "0");
function rgbParaHex({ r, g, b }) {
    return `#${canal(r)}${canal(g)}${canal(b)}`;
}
function normalizarHex(hex) {
    return rgbParaHex(hexParaRgb(hex));
}
function hexParaLinear(hex) {
    const { r, g, b } = hexParaRgb(hex);
    return [srgbParaLinear(r / 255), srgbParaLinear(g / 255), srgbParaLinear(b / 255)];
}
function linearParaHex(lin) {
    const [r, g, b] = lin;
    const f = (v) => linearParaSrgb(Math.max(0, Math.min(1, v))) * 255;
    return rgbParaHex({ r: f(r), g: f(g), b: f(b) });
}
function linearParaOklab(lin) {
    const [r, g, b] = lin;
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    const lr = Math.cbrt(l);
    const mr = Math.cbrt(m);
    const sr = Math.cbrt(s);
    return {
        L: 0.2104542553 * lr + 0.793617785 * mr - 0.0040720468 * sr,
        a: 1.9779984951 * lr - 2.428592205 * mr + 0.4505937099 * sr,
        b: 0.0259040371 * lr + 0.7827717662 * mr - 0.808675766 * sr,
    };
}
function oklabParaLinear({ L, a, b }) {
    const lr = L + 0.3963377774 * a + 0.2158037573 * b;
    const mr = L - 0.1055613458 * a - 0.0638541728 * b;
    const sr = L - 0.0894841775 * a - 1.291485548 * b;
    const l = lr * lr * lr;
    const m = mr * mr * mr;
    const s = sr * sr * sr;
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
}
function hexParaOklab(hex) {
    return linearParaOklab(hexParaLinear(hex));
}
function hexParaOklch(hex) {
    const { L, a, b } = hexParaOklab(hex);
    const h = (Math.atan2(b, a) * 180) / Math.PI;
    return { L, C: Math.hypot(a, b), h: h < 0 ? h + 360 : h };
}
function oklchParaLinear({ L, C, h }) {
    const rad = (h * Math.PI) / 180;
    return oklabParaLinear({ L, a: C * Math.cos(rad), b: C * Math.sin(rad) });
}
const dentroDoSrgb = (lin) => lin.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
function oklchParaHex({ L, C, h }) {
    const Lc = Math.max(0, Math.min(1, L));
    const direto = oklchParaLinear({ L: Lc, C, h });
    if (dentroDoSrgb(direto))
        return linearParaHex(direto);
    let cabe = 0;
    let estoura = C;
    for (let i = 0; i < 40; i += 1) {
        const meio = (cabe + estoura) / 2;
        if (dentroDoSrgb(oklchParaLinear({ L: Lc, C: meio, h })))
            cabe = meio;
        else
            estoura = meio;
    }
    return linearParaHex(oklchParaLinear({ L: Lc, C: cabe, h }));
}
function deltaEOklab(a, b) {
    const x = hexParaOklab(a);
    const y = hexParaOklab(b);
    return Math.hypot(x.L - y.L, x.a - y.a, x.b - y.b);
}
function compor(cor, alfa, sobre) {
    const c = hexParaRgb(cor);
    const s = hexParaRgb(sobre);
    const a = Math.max(0, Math.min(1, alfa));
    return rgbParaHex({
        r: c.r * a + s.r * (1 - a),
        g: c.g * a + s.g * (1 - a),
        b: c.b * a + s.b * (1 - a),
    });
}
const ESCADA_L = [
    0.9695, 0.9317, 0.8597, 0.7634, 0.6718, 0.5899, 0.5015, 0.4303, 0.3772, 0.339, 0.2278,
];
const CURVA_C = [
    0.11, 0.247, 0.486, 0.765, 1.021, 1.111, 1.0, 0.789, 0.63, 0.508, 0.334,
];
const K = 6;
const L0 = ESCADA_L[0];
const L10 = ESCADA_L[10];
const LK = ESCADA_L[K];
const CK = CURVA_C[K];
function lightnessDoStop(indice, Lsemente) {
    const L = ESCADA_L[indice] ?? LK;
    return indice <= K
        ? L0 + (L - L0) * ((Lsemente - L0) / (LK - L0))
        : Lsemente + (L - LK) * ((L10 - Lsemente) / (L10 - LK));
}
function rampaDeSemente(semente) {
    const { L: Ls, C: Cs, h } = hexParaOklch(semente);
    const C0 = Cs / CK;
    const stops = ESCADA_L.map((_, i) => oklchParaHex({ L: lightnessDoStop(i, Ls), C: C0 * (CURVA_C[i] ?? 1), h }));
    stops[K] = normalizarHex(semente);
    return stops;
}
function indiceDoGrau(grau) {
    return GRAUS.indexOf(grau);
}
function stop(rampa, indice) {
    return rampa[Math.max(0, Math.min(10, Math.round(indice)))] ?? rampa[K];
}

window.LegacyRamp={rampaDeSemente,GRAUS,ehHexValido,normalizarHex};
})();
