// Original synthesis. Published parameters and reconstruction limits are linked in each listening guide.
(() => {
  const SR = 24000;
  const TAU = Math.PI * 2;
  const STEP = 10;
  const tone = (hz, t) => Math.sin(TAU * hz * t);
  const signal = (seconds, fn) => Float32Array.from({length: Math.round(seconds * SR)}, (_, i) => fn(i / SR, i));
  const pure = (hz, seconds = 2) => signal(seconds, t => 0.55 * tone(hz, t));
  const ans = () => signal(2, t => .48 * tone(2100, t) * (Math.floor(t / .45) % 2 ? -1 : 1));
  const ansam = () => signal(2, t => .48 * (1 + .2 * tone(15, t)) * tone(2100, t) * (Math.floor(t / .45) % 2 ? -1 : 1));

  function scrambler(a, b) {
    let state = 0;
    return () => {
      const next = (1 ^ (state >>> (a - 1)) ^ (state >>> (b - 1))) & 1;
      state = (state << 1 | next) & ((1 << b) - 1);
      return next;
    };
  }

  // Finite raised-cosine interpolation approximates transmitter shaping.
  // Precompute the polyphase kernel for each integer oversampling factor.
  function modulate(points, baud, carrier, scale) {
    const sps = SR / baud;
    const kernel = Array.from({length:sps}, (_, k) => Array.from({length:9}, (_, j) => {
      const x = k / sps + 4 - j;
      if (!x) return 1;
      const sinc = Math.sin(Math.PI * x) / (Math.PI * x);
      if (Math.abs(Math.abs(x) - 1) < 1e-9) return Math.PI * sinc / 4;
      return sinc * Math.cos(Math.PI * x / 2) / (1 - x * x);
    }));
    return signal(points.length / baud, (t, i) => {
      const n = Math.floor(i / sps);
      let real = 0, imag = 0;
      for (let j = 0; j < 9; j++) {
        const point = points[Math.min(points.length - 1, Math.max(0, n + j - 4))];
        const weight = kernel[i % sps][j];
        real += point[0] * weight;
        imag += point[1] * weight;
      }
      return scale * (real * Math.cos(TAU * carrier * t) - imag * tone(carrier, t));
    });
  }

  function psk(mode) {
    const bit = scrambler(14, 17);
    let angle = 0;
    const count = mode === 's1' ? 60 : 900;
    const points = Array.from({length:count}, (_, i) => {
      const dibit = mode === 's1' ? (i % 2 ? 3 : 0) : 2 * bit() + bit();
      angle += [1, 0, 2, -1][dibit] * Math.PI / 2;
      return [Math.cos(angle), Math.sin(angle)];
    });
    return modulate(points, 600, 1200, .45);
  }

  function qamExercise() {
    const bit = scrambler(14,17);
    const levels = [-3,-1,1,3];
    return modulate(Array.from({length:900}, () =>
      [levels[2 * bit() + bit()], levels[2 * bit() + bit()]]), 600, 1200, .14);
  }

  function fskText() {
    const bits = [];
    for (const char of 'HELLO\r\n') {
      bits.push(0);
      for (let i = 0; i < 8; i++) bits.push(char.charCodeAt(0) >> i & 1);
      bits.push(1);
    }
    let phase = 0;
    return signal(2, (t, i) => {
      const mark = bits[Math.floor(i / 80) % bits.length];
      phase += TAU * (mark ? 1270 : 1070) / SR;
      return .3 * Math.sin(phase) + .3 * tone(2225, t);
    });
  }

  function training32() {
    const bit = scrambler(5,23);
    const constellation = [[1,0],[0,1],[0,-1],[-1,0]];
    const points = Array.from({length:2400}, (_, i) => {
      const high = bit(), low = bit();
      return constellation[i < 256 ? high * 3 : 2 * high + low];
    });
    return modulate(points, 2400, 1800, .45);
  }

  function probe() {
    // Signed harmonic indices encode 0 or 180 degrees in V.34 table 17.
    const harmonics = [1,-2,3,4,5,7,9,10,-11,13,14,-15,17,-18,19,-20,-21,-22,-23,24,25];
    const period = signal(1 / 150, t => harmonics.reduce((sum, n) =>
      sum + Math.sign(n) * Math.cos(TAU * Math.abs(n) * 150 * t), 0) / 11);
    return signal(.56, (t,i) => period[i % period.length] * (t < .16 ? 1 : 10 ** (-6 / 20)));
  }

  function pcmTraining() {
    // G.711 mu-law magnitude for UINFO = 80 and UINFO + 16; V.90 table 1.
    const magnitude = u => (((u % 16) * 8 + 132) * 2 ** (u >> 4) - 132);
    const w = magnitude(96) / magnitude(80);
    const bit = scrambler(18,23);
    const rhythm = [1,0,1,-1,0,-1];
    const samples = Array.from({length:432+12000}, (_, n) => {
      if (n < 432) return rhythm[n % 6] * (n < 384 ? w : -w);
      return bit() ? 1 : -1;
    });
    // Windowed-sinc reconstruction of the 8 kHz samples, not a measured subscriber loop.
    const kernel = Array.from({length:3}, (_, p) => Array.from({length:17}, (_, j) => {
      const x = p / 3 - (j - 8);
      if (!x) return 1;
      return Math.sin(Math.PI * x) / (Math.PI * x) * (.5 + .5 * Math.cos(Math.PI * x / 9));
    }));
    return signal(samples.length / 8000, (_, i) => {
      let value = 0;
      for (let j = 0; j < 17; j++) value += (samples[Math.floor(i/3)+j-8] || 0) * kernel[i%3][j];
      return .28 * value;
    });
  }

  const stage = (name, note, make) => ({name,note,make});
  const answer = stage('Answer tone','A steady 2,100 Hz note announces an answering modem. The periodic phase flips in this excerpt can disable network echo control.',ans);
  const modAnswer = stage('Answer tone','A 2,100 Hz whistle trembles 15 times a second. This V.8 answer invites the caller to exchange capability menus.',ansam);
  const lineProbe = stage('Line probe','Twenty-one pitches sound together. A loud 160 ms burst (L1) gives way to the same chord 6 dB lower (L2). Differences at the receiver reveal which pitches the line damages.',probe);
  const train = stage('Training','The answer modem scrambles a stream of ones. First it uses two opposite points, then four. This repeatable rough sound gives its partner a reference for undoing distortion.',training32);
  const itu = rec => 'https://www.itu.int/rec/T-REC-' + rec + '/en';
  const v8 = ['V.8 §7.2',itu('V.8-199802-S')];
  const programs = {
    300: ['Bell 103A2','Two voices on one wire','The pitches and bit timing follow the 103A2 frequency plan. The order, listening intervals and HELLO message are an editorial demonstration.', [
      stage('Answer mark','The answering end holds its high mark at 2,225 Hz. A steady pitch can mean the line is idle and ready.',()=>pure(2225)),
      stage('Caller joins','The caller adds its 1,270 Hz mark. Two notes can travel together because each receiver listens in a different band.',()=>signal(2,t=>.3*(tone(2225,t)+tone(1270,t)))),
      stage('Connected','The caller sends HELLO, a carriage return and a line feed at 300 bit/s. Its pitch shifts between 1,070 and 1,270 Hz. The far end continues marking.',fskText)
    ],[['Bell System Practices, table A','https://bitsavers.org/communications/westernElectric/modems/591-014-100_Data_Set_103A_Identification_and_Operation_Jan67.pdf']]],
    1200: ['V.22','A carrier learns to turn','Selected start-up signals. The caller uses differential phase steps and the specified scrambler. Pulse shaping is approximate. Guard tones and inter-modem delays are omitted.',[
      answer, stage('High-band mark','On a 2,400 Hz carrier, successive 11 dibits turn the phase back a quarter turn at each 600-baud step. The dominant pitch is 2,250 Hz, isolated here.',()=>pure(2250)),
      stage('Scrambled ones','The caller trains in the low band. Pairs of scrambled bits choose among four phase changes. What sounds like a rasp still has a precise clock.',()=>psk('sb1'))
    ],[['V.22 §§2.5, 5, 6.3',itu('V.22-198811-I')],['V.150.1, appendix V',itu('V.150.1-200301-I')]]],
    2400: ['V.22bis','A hundred-millisecond invitation','The first two excerpts model caller start-up. The final 16-point exercise uses illustrative symbol choices. Shaping is approximate and the two-way exchange is omitted.',[
      stage('S1 invitation','The caller alternates dibits 00 and 11 for 100 ms. This little chirp announces a 2,400 bit/s candidate to a listening modem.',()=>psk('s1')),
      stage('Four positions','The caller follows S1 with scrambled ones at 1,200 bit/s. Listen for the change from the regular invitation to a more varied pattern.',()=>psk('sb1')),
      stage('Sixteen positions','After agreement, four bits can select a point at each tick. This teaching stream visits sixteen amplitude-and-phase positions on the same 600-baud clock.',qamExercise)
    ],[['V.22bis §§2.5, 6.3',itu('V.22bis-198811-I')]]],
    9600: ['V.32','Measuring the return trip','Selected start-up excerpts. The two ranging pitches represent an ideal equal-level line. Training uses the answer scrambler and start-up symbol mapping with approximate shaping.',[
      answer,stage('Ranging','Alternating opposite states produces components at 600 and 3,000 Hz. Phase reversals make recognizable timing marks for measuring a round trip. Here you hear the steady portion.',()=>signal(2,t=>.3*(tone(600,t)+tone(3000,t)))),
      train
    ],[['V.32 §§5.2, 5.4, appendix I',itu('V.32-199303-I')]]],
    14400: ['V.32bis','Recognizing a familiar voice','The family shares much of its start-up. The closing excerpt jumps ahead to a later rate renegotiation. It isolates the short caller preamble and omits the ensuing rate words.',[
      stage('Caller carrier','Repeated state A yields a steady 1,800 Hz note. This carrier sits in the same band used by the modem at the far end.',()=>pure(1800)),train,
      stage('Change rate','On a working connection a caller can request a new rate. Its preamble holds A for 56 symbols, then flips to C for eight. The pitch persists across the reversal.',()=>signal(64/2400,(t,i)=>.55*tone(1800,t)*(i<560?1:-1)))
    ],[['V.32bis §§5.2, 6, 8',itu('V.32bis-199102-I')]]],
    28800: ['V.34','Listening across the band','Nominal V.8 answer and V.34 phase-two signals. The probe uses table 17 frequencies and phases. The 400 ms L2 is an example duration. Menu exchange, training and rate selection are omitted.',[
      modAnswer,stage('Ranging tone','The calling modem holds tone B at 1,200 Hz. In the two-way procedure the modems use a reversal of this tone as a timing mark.',()=>pure(1200)),lineProbe
    ],[v8,['V.34 (1994) §§10.1.2, 11.2',itu('V.34-199409-S')]]],
    33600: ['V.34, revised','The line still sets the ceiling','The revised standard retains the earlier probe. These shared signals alone cannot identify a 33.6 kbit/s connection. The final excerpt isolates the answer modem’s return to ranging.',[
      modAnswer,lineProbe,stage('Ranging reply','After probing, the answer modem sends tone A at 2,400 Hz alongside a 1,800 Hz guard. After 50 ms the upper tone reverses, then both end 10 ms later.',()=>signal(.06,t=>.3*(tone(1800,t)+10**(-1/20)*tone(2400,t)*(t<.05?1:-1))))
    ],[v8,['V.34 (1998) §§10.1.2, 11.2.1.2.6',itu('V.34-199802-I')]]],
    56000: ['V.90','Training from the digital end','A montage of phases 1, 2 and 3. The PCM training excerpt renders the digital modem’s specified signs at 8,000 samples/s using a sample μ-law level and idealized reconstruction. The montage cuts from training to the monitor speaker after connection, skipping impairment learning, parameter exchange and payload.',[
      modAnswer,lineProbe,stage('PCM training','A repeating six-sample pattern marks frame timing, then its polarity flips. The digital modem follows with known scrambled signs (TRN1d).',pcmTraining),
      stage('Connected','The terminal receives CONNECT. With speaker mode M1 the monitor falls silent after carrier detection. This flat trace represents the speaker output while the modems keep exchanging data on the wire.',()=>new Float32Array(SR))
    ],[v8,['V.34 table 17',itu('V.34-199802-I')],['V.90 §§5.2–3, 8.4, 9.3–4',itu('V.90-199809-I')],['V.25ter §6.3.14',itu('V.25ter-199707-S')]]]
  };

  const clock = time => '0:' + String(Math.floor(time)).padStart(2,'0');
  let context;
  let currentPlayer;
  window.addEventListener('cover-audio-start', () => currentPlayer?.pause());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) currentPlayer?.pause();
  });
  let serial = 0;
  class SignalPlayer extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      const program = programs[this.getAttribute('rate')];
      if (!program) return;
      this.initialized = true;
      const [standard,title,method,stages,sources] = program;
      this.stages = stages;
      this.duration = STEP * stages.length;
      this.position = 0;
      this.stageIndex = -1;
      this.revision = 0;
      const id = 'listening-' + ++serial;
      this.innerHTML = `<section class="sp-console" aria-labelledby="${id}"><header class="sp-heading"><div class="sp-label">Synthesized excerpts · ${standard}</div><h3 id="${id}">${title}</h3><p class="sp-method">${method}</p></header>
      <div class="sp-instrument"><div class="sp-meta"><span>Oscilloscope</span><span>12 ms window</span></div><canvas aria-hidden="true"></canvas><div class="sp-legend"><label><input type="checkbox" class="sp-ref"> Opening trace</label><label><input type="checkbox" class="sp-grid" checked> Time grid</label></div></div>
      <div class="sp-transport"><button class="sp-play" type="button">▶ Play</button><button class="sp-reset" type="button">Restart</button><label class="sp-seek"><span class="sp-hidden">Playback position in seconds</span><input type="range" min="0" max="${this.duration}" step="0.05" value="0"></label><span class="sp-clock">0:00 / ${clock(this.duration)}</span></div>
      <div class="sp-steps" role="group" aria-label="Seek to a signal">${stages.map((s,i)=>`<button type="button" data-stage="${i}">${s.name}</button>`).join('')}</div>
      <p class="sp-status" aria-live="polite"></p><details><summary>Signal notes &amp; sources</summary><p>Each excerpt repeats with listening gaps over ten seconds. All timings on the transport refer to this edited demonstration.</p><p>The bright trace follows the audible signal. The dashed overlay freezes the first 12 milliseconds of the opening excerpt for comparison. Grid divisions represent one millisecond. Height represents instantaneous amplitude.</p><ol>${stages.map(s=>`<li><strong>${s.name}.</strong> ${s.note}</li>`).join('')}</ol><p>${sources.map(([label,link])=>`<a href="${link}">${label}</a>`).join(' · ')}</p></details></section>`;
      this.playButton = this.querySelector('.sp-play');
      this.range = this.querySelector('[type=range]');
      this.canvas = this.querySelector('canvas');
      this.playButton.onclick = () => this.source || this.pending ? this.pause() : this.play();
      this.querySelector('.sp-reset').onclick = () => this.seek(0);
      this.range.oninput = () => this.seek(Number(this.range.value));
      this.querySelectorAll('[data-stage]').forEach(b => b.onclick = () => this.seek(Number(b.dataset.stage)*STEP));
      this.querySelectorAll('[type=checkbox]').forEach(b=>b.onchange=()=>this.draw());
      this.resize = new ResizeObserver(() => this.draw());
      this.resize.observe(this.canvas);
      this.render();
    }
    disconnectedCallback() {
      this.pause();
      this.resize?.disconnect();
      this.initialized = false;
    }
    samples() {
      if (this.pcm) return this.pcm;
      const mix = new Float32Array(this.duration * SR);
      this.stages.forEach((stage, index) => {
        const clip = stage.make();
        const stride = clip.length + Math.round(.45 * SR);
        const base = index * STEP * SR;
        for (let i = 0; i < STEP * SR; i++) {
          const j = i % stride;
          if (j >= clip.length) continue;
          const edge = Math.min(1,j/12,(clip.length-1-j)/12,(STEP*SR-1-i)/12);
          mix[base+i] = clip[j] * edge;
        }
      });
      this.pcm = mix;
      return mix;
    }
    seek(position) {
      const resume = !!this.source || this.pending;
      this.pause();
      this.position = position;
      this.render();
      if (resume && position < this.duration) this.play();
    }
    async play() {
      currentPlayer?.pause();
      currentPlayer = this;
      window.dispatchEvent(new Event('chapter-audio-start'));
      if (this.position >= this.duration) this.position = 0;
      const revision = ++this.revision;
      this.pending = true;
      try {
        context ??= new (window.AudioContext || window.webkitAudioContext)();
        if (context.state !== 'running') await context.resume();
        if (revision !== this.revision) return;
        const src = context.createBufferSource();
        if (!this.buffer) {
          this.buffer = context.createBuffer(1,this.duration*SR,SR);
          this.buffer.copyToChannel(this.samples(),0);
        }
        src.buffer = this.buffer;
        const gain = context.createGain();
        gain.gain.value = .32;
        src.connect(gain).connect(context.destination);
        this.started = context.currentTime - this.position;
        this.source = src;
        src.onended = () => {
          gain.disconnect();
          src.disconnect();
          if (src !== this.source) return;
          this.source = null;
          this.position = this.duration;
          this.render();
        };
        src.start(0,this.position);
        this.tick();
      } catch {
        this.querySelector('.sp-status').textContent = 'Audio could not start. The seek controls and signal notes are available for silent exploration.';
      } finally {
        if (revision === this.revision) this.pending = false;
      }
    }
    pause() {
      this.revision++;
      this.pending = false;
      if (!this.source) return;
      this.position = Math.min(this.duration,context.currentTime-this.started);
      const old = this.source;
      this.source = null;
      old.stop();
      cancelAnimationFrame(this.frame);
      this.render();
    }
    tick() {
      if (!this.source) return;
      this.position = Math.min(this.duration,context.currentTime-this.started);
      this.render();
      this.frame = requestAnimationFrame(()=>this.tick());
    }
    render() {
      const index = Math.min(this.stages.length - 1,Math.floor(this.position/STEP));
      if (this.stageIndex !== index || this.position === this.duration) {
        this.stageIndex = index;
        const s = this.stages[index];
        this.querySelector('.sp-status').textContent = (this.position === this.duration ? 'Excerpt complete. ' : '') + s.note;
        this.querySelectorAll('[data-stage]').forEach((b,i)=>b.setAttribute('aria-pressed', String(i===index)));
      }
      this.playButton.textContent = this.source ? 'Ⅱ Pause' : this.position >= this.duration ? '▶ Replay' : '▶ Play';
      this.range.value = this.position;
      this.range.setAttribute('aria-valuetext',clock(this.position)+' of '+clock(this.duration));
      this.querySelector('.sp-clock').textContent = clock(this.position)+' / '+clock(this.duration);
      this.draw();
    }
    draw() {
      const canvas = this.canvas;
      const width = canvas.clientWidth;
      if (!width) return;
      const height = canvas.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1,2);
      if (canvas.width !== Math.round(width*dpr) || canvas.height !== Math.round(height*dpr)) {
        canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
      }
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,width,height);
      if (this.querySelector('.sp-grid').checked) {
        ctx.beginPath();
        for (let i=0;i<=12;i++) {
          const x=width*i/12; ctx.moveTo(x,0); ctx.lineTo(x,height);
        }
        for (let i=1;i<4;i++) {
          const y=height*i/4; ctx.moveTo(0,y); ctx.lineTo(width,y);
        }
        ctx.strokeStyle='#365050';ctx.lineWidth=1;ctx.stroke();
      }
      const samples=this.samples();
      const count=Math.round(SR*.012);
      const trace=(start,color,dashed)=>{
        ctx.beginPath();
        for (let i=0;i<count;i++) {
          const y=height*(.5-.45*(samples[start+i] || 0)), x=i*width/(count-1);
          if (!i) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.setLineDash(dashed?[4,3]:[]);ctx.stroke();ctx.setLineDash([]);
      };
      // Reduced motion freezes each stage at its opening while time and captions advance.
      const position=this.source && matchMedia('(prefers-reduced-motion: reduce)').matches ? this.stageIndex * STEP : this.position;
      trace(Math.min(samples.length-count,Math.floor(position*SR)),'#91eac9',false);
      if (this.querySelector('.sp-ref').checked) trace(0,'#ffbf84',true);
    }
  }
  customElements.define('signal-player',SignalPlayer);
})();
