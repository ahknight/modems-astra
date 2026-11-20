// The analyzer and its player share the same mono PCM buffer.
(() => {
  const duration = 12, sampleRate = 12000, tau = 2 * Math.PI;
  const pcm = new Float32Array(sampleRate * duration);
  const probe = [1,-2,3,4,5,7,9,10,-11,13,14,-15,17,-18,19,-20,-21,-22,-23,24,25].map(n => n * 150);
  const pairs = [[697,1209],[770,1336],[852,1477]];
  for (let i = 0; i < pcm.length; i++) {
    const t = i / sampleRate;
    const local = t < 4 ? t % (4/3) : t % 4;
    const tones = t < 4 ? pairs[Math.min(2, Math.floor(t * 3/4))] : t < 8 ? [2100] : probe;
    const end = t < 4 ? 1.19 : 4;
    const envelope = Math.min(1, local * 100, Math.max(0, (end - local) * 100));
    pcm[i] = envelope * .14 * tones.reduce((sum,f) =>
      sum + Math.sign(f) * Math.cos(tau*Math.abs(f)*t), 0) / Math.sqrt(tones.length);
  }
  const canvas = document.querySelector('#waterfall'), pen = canvas.getContext('2d');
  const lines = [], bins = 172, frame = 512, count = 67;
  for (let row = 0; row < count; row++) {
    const offset = Math.floor(row/(count-1)*(pcm.length-frame));
    const heights = [];
    for (let b = 0; b < bins; b++) {
      let real = 0, imag = 0;
      const angle = tau * 4000 * b / (bins-1) / sampleRate;
      for (let n = 0; n < frame; n++) {
        const windowed = pcm[offset+n]*(.5-.5*Math.cos(tau*n/(frame-1)));
        real += windowed*Math.cos(n*angle);
        imag += windowed*Math.sin(n*angle);
      }
      heights.push(Math.max(0,Math.log10(1+Math.hypot(real,imag)*5))*47);
    }
    lines.push(heights);
  }
  function draw(time, highlighted) {
    const w=canvas.width,h=canvas.height;
    pen.fillStyle='#0e231b'; pen.fillRect(0,0,w,h);
    pen.strokeStyle='#263f2c'; pen.lineWidth=.8;
    for(let x=0;x<w;x+=44){pen.beginPath();pen.moveTo(x,0);pen.lineTo(x,h);pen.stroke()}
    for(let y=0;y<h;y+=40){pen.beginPath();pen.moveTo(0,y);pen.lineTo(w,y);pen.stroke()}
    lines.forEach((values,row)=>{
      const z=row/(count-1), left=110*(1-z)+4, base=86+z*(h-96), span=w-128+z*109;
      const active=highlighted && Math.round(time/duration*(count-1))===row;
      pen.beginPath();pen.moveTo(left,base);
      values.forEach((v,i)=>pen.lineTo(left+i/(bins-1)*span,base-v*(1+.4*z)));
      pen.lineTo(left+span,base);pen.closePath();pen.fillStyle='#10281c';pen.fill();
      pen.strokeStyle=active?'#ffdc85':'hsl('+ (87-z*14)+' 72% '+(45+z*29)+'%)';
      pen.lineWidth=active?4:1.35;pen.stroke();
    });
  }
  const play=document.querySelector('#listen'), seek=document.querySelector('#seek'), timer=document.querySelector('#timer');
  let ctx, buffer, src, start=0, pos=0, raf, epoch=0;
  const phase=t=> t>=12?'Study complete':t<4?'Dial · paired tones':t<8?'Answer · steady tone':'Probe · many tones';
  const label=document.querySelector('.readout span');
  function display(t) {
    seek.value=t;timer.textContent='00:'+String(Math.floor(t)).padStart(2,'0')+' / 00:12';
    label.textContent=t || src ? phase(t) : 'FREQUENCY WATERFALL';
    const still = src && matchMedia("(prefers-reduced-motion: reduce)").matches;
    draw(still ? Math.min(8, Math.floor(t / 4) * 4) : t, Boolean(t || src));
  }
  function pause(){
    epoch++;cancelAnimationFrame(raf);
    if(src){pos=Math.min(duration,ctx.currentTime-start);src.onended=null;src.stop();src.disconnect();src=null}
    play.lastElementChild.textContent='Play signal study';play.firstElementChild.textContent='▶';display(pos);
  }
  function update(){if(!src)return;display(Math.min(duration,ctx.currentTime-start));raf=requestAnimationFrame(update)}
  async function begin(){
    const current=++epoch;
    try {
      ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      await ctx.resume(); if(current!==epoch)return;
      window.dispatchEvent(new Event('cover-audio-start'));
      if(!buffer){buffer=ctx.createBuffer(1,pcm.length,sampleRate);buffer.copyToChannel(pcm,0)}
      if(pos>=duration)pos=0;
      src=ctx.createBufferSource();src.buffer=buffer;src.connect(ctx.destination);
      start=ctx.currentTime-pos;src.onended=()=>{pause();pos=duration;display(pos)};src.start(0,pos);
      play.lastElementChild.textContent='Pause study';play.firstElementChild.textContent='Ⅱ';update();
    } catch {label.textContent='Audio unavailable · see field notes';}
  }
  play.onclick=()=>src?pause():begin();
  seek.oninput=()=>{const target=Number(seek.value),active=Boolean(src);pause();pos=target;display(pos);if(active&&pos<duration)begin()};
  document.querySelector('#rewind').onclick=()=>{const active=Boolean(src);pause();pos=0;display(pos);if(active)begin()};
  window.addEventListener('chapter-audio-start',pause);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
  display(0);
})();
