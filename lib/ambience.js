/* Ambient soundscape — a synthesized tanpura-ish drone + temple bell,
   built on raw WebAudio so the invite ships with zero audio assets. */
export class Ambience {
  start() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const t = this.ctx.currentTime;
    this.master = this.ctx.createGain();
    this.master.gain.setValueAtTime(0.0001, t);
    this.master.gain.exponentialRampToValueAtTime(0.055, t + 2.5);
    this.master.connect(this.ctx.destination);
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 520; lp.Q.value = 0.6;
    lp.connect(this.master);
    this.oscs = [[138.59, "sine", 0.5], [138.59 * 1.5, "triangle", 0.22], [69.3, "sine", 0.3]]
      .map(([f, type, g]) => {
        const o = this.ctx.createOscillator(); const og = this.ctx.createGain();
        o.type = type; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 7;
        og.gain.value = g; o.connect(og); og.connect(lp); o.start(); return o;
      });
    this.lfo = this.ctx.createOscillator(); this.lfoG = this.ctx.createGain();
    this.lfo.frequency.value = 0.09; this.lfoG.gain.value = 120;
    this.lfo.connect(this.lfoG); this.lfoG.connect(lp.frequency); this.lfo.start();
    const bell = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const f = [554.37, 659.25, 739.99, 830.61][Math.floor(Math.random() * 4)];
      const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
      o.type = "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      o.connect(g); g.connect(this.master); o.start(now); o.stop(now + 3.4);
    };
    this.bellTimer = setInterval(bell, 7000 + Math.random() * 5000);
    setTimeout(bell, 1200);
  }
  stop() {
    if (!this.ctx) return;
    clearInterval(this.bellTimer);
    const t = this.ctx.currentTime;
    try { this.master.gain.exponentialRampToValueAtTime(0.0001, t + 1.2); } catch {}
    const ctx = this.ctx; this.ctx = null;
    setTimeout(() => { try { ctx.close(); } catch {} }, 1400);
  }
}

/* ════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — silk-at-night default, haldi-ivory day theme.
   ════════════════════════════════════════════════════════════════════ */
