/* Áudio 100% sintetizado — nenhum arquivo de mídia, funciona offline */
var Snd = (function () {
  var ctx = null, on = true, musicTimer = null, musicGain = null, musicOn = false;

  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended' && ctx.resume) { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    var c = ensure(); if (!c || !on) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, c.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), c.currentTime + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(vol || 0.14, c.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + dur + 0.02);
  }

  return {
    setEnabled: function (v) { on = !!v; if (!on) this.stopMusic(); },
    enabled: function () { return on; },
    tap: function () { tone(520, 0.05, 'triangle', 0.07); },
    good: function () { tone(523, 0.10, 'sine', 0.13); setTimeout(function () { tone(784, 0.16, 'sine', 0.12); }, 90); },
    bad: function () { tone(220, 0.16, 'sawtooth', 0.10, 130); },
    alert: function () { tone(660, 0.09, 'square', 0.08); setTimeout(function () { tone(880, 0.12, 'square', 0.07); }, 100); },
    stamp: function () { tone(120, 0.22, 'sine', 0.16, 60); setTimeout(function () { tone(300, 0.10, 'square', 0.06); }, 60); },
    startMusic: function () {
      var c = ensure(); if (!c || !on || musicOn) return;
      musicOn = true;
      var notes = [110, 116.5, 138.6, 110, 98, 110, 146.8, 138.6];
      var i = 0;
      musicTimer = setInterval(function () {
        if (!musicOn || !on) return;
        tone(notes[i % notes.length], 0.9, 'sine', 0.035);
        if (i % 4 === 0) tone(notes[i % notes.length] / 2, 1.4, 'triangle', 0.028);
        i++;
      }, 620);
    },
    stopMusic: function () { musicOn = false; if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }
  };
})();
