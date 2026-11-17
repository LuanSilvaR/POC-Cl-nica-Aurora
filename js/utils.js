(() => {
  function luminance(hex) {
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return rgb.reduce((total, v, i) => total + v * [.2126, .7152, .0722][i], 0);
  }
  function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
  function readable(color) { return /^#[0-9a-f]{6}$/i.test(color) && contrast(color, '#ffffff') >= 4.5 && contrast(color, '#e7efeb') >= 4.5; }
  window.Utils = { contrast, readable };
})();
